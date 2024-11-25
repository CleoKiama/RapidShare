import React from "react";
import { Line } from "rc-progress";
import PropTypes from "prop-types";

export default function TransferProgressError({ onNavigateBack, progress }) {
	//TODO Get the actual DeviceName
	return (
		<div>
			<img
				onClick={onNavigateBack}
				src="static://assets/arrow_back.svg"
				alt="navigate back"
			/>
			<p className="text-gray-700 mt-3">something went wrong</p>
			<p className="text-red-700">{progress.bytesTransferred} </p>
			<Line
				strokeColor="red"
				strokeWidth={10}
				strokeLinecap="square"
				percent={progress.percentageProgress}
			/>
		</div>
	);
}

TransferProgressError.propTypes = {
	onNavigateBack: PropTypes.func.isRequired,
	progress: PropTypes.object.isRequired,
};
