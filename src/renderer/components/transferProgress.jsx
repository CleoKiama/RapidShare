import React, { useState, useEffect } from "react";
import { Line } from "rc-progress";
import { CancelTransferModel } from "./cancelModal.jsx";
import PropTypes from "prop-types";
import TransferProgressCanceled from "./transferProgressCanceled.jsx";
import TransferProgressError from "./transferProgressError.jsx";

export default function TransferProgress(props) {
	const [isCanceled, setIsCanceled] = useState(false);
	const [error, setError] = useState(false);
	const [progress, setProgress] = useState({
		percentageProgress: 0,
		bytesTransferred: 0,
	});
	useEffect(() => {
		const listener = (_, progress) => {
			setProgress(() => {
				return {
					percentageProgress: progress.percentageProgress,
					bytesTransferred: progress.bytesTransferred,
				};
			});
		};
		const onError = (_, _error) => {
			setError(true);
		};
		window.electron.on("fileProgress", listener);
		window.electron.on("error", onError);
		return () => {
			window.electron.removeListener("fileProgress", listener);
			window.electron.removeListener("error", onError);
		};
	}, []);
	useEffect(() => {
		if (isCanceled || error) {
			//once it is cancel start listening incase a new transfer starts and reset the ui to update
			const listener = (_, status) => {
				setIsCanceled(false);
				setError(false);
				setProgress({ percentageProgress: 0, bytesTransferred: 0 });
			};
			window.electron.on("transferring", listener);
			return () => {
				window.electron.removeListener("transferring", listener);
			};
		}
	}, [isCanceled, error]);

	const handleCancel = async () => {
		await window.electron.invoke("cancelTransfer");
		setIsCanceled(true);
	};

	//TODO: Get the actual DeviceName
	if (error) {
		return (
			<TransferProgressError
				onNavigateBack={props.onNavigateBack}
				progress={progress}
			/>
		);
	}
	const transferMessage = {
		sending: "sending files to",
		receiving: "receiving files from",
	};
	return (
		<>
			{isCanceled ? (
				<TransferProgressCanceled
					onNavigateBack={props.onNavigateBack}
					progress={progress}
				/>
			) : (
				<div>
					<h5>
						{transferMessage[props.transferStatus.status]}{" "}
						{props.transferStatus.deviceName}
					</h5>
					<p className="text-gray-700">{progress.bytesTransferred} </p>
					<Line
						strokeColor="blue"
						strokeWidth={10}
						strokeLinecap="square"
						percent={progress.percentageProgress}
					/>
					{!isCanceled && <CancelTransferModel onCancel={handleCancel} />}
				</div>
			)}
		</>
	);
}

TransferProgress.propTypes = {
	onNavigateBack: PropTypes.func.isRequired,
	transferStatus: PropTypes.shape({
		deviceName: PropTypes.string,
		status: PropTypes.string,
	}),
};
