import React, { useEffect, useState } from "react";
import Container from "./components/container.jsx";
import Nav from "./components/nav.jsx";
import Fallback from "./components/fallback.jsx";
import { ErrorBoundary } from "react-error-boundary";
import ThisDevice from "./components/thisDevice.jsx";
import DiscoveredDevices from "./components/discoveredDevices.jsx";
import TransferProgress from "./components/transferProgress.jsx";
import Settings from "./components/settings.jsx";

export default function App() {
	const [transferStatus, setTransferStatus] = useState({
		started: false,
		deviceName: "",
		status: "",
	});
	const [navState, setNavState] = useState("devices");
	useEffect(() => {
		const listener = (_, { started, deviceName, status }) => {
			setTransferStatus({
				started,
				deviceName,
				status,
			});
		};
		window.electron.on("transferring", listener);
		return () => {
			window.electron.removeListener("transferring", listener);
		};
	}, []);
	const HandleNavigationBack = () => {
		setTransferStatus(false);
	};
	const updateNav = (nav) => {
		setNavState(nav);
	};
	return (
		<ErrorBoundary fallbackRender={Fallback}>
			<main className="mx-auto h-screen  min-w-[474px]  rounded-2xl bg-grey-200 px-6 py-4">
				<h1 className="pl-4 font-semibold text-xl pb-1">RapidShare</h1>
				<Container>
					{!transferStatus.started && (
						<Nav navState={navState} onNavUpdate={updateNav} />
					)}
					{navState === "devices" ? (
						<div className="pl-4">
							{transferStatus.started ? (
								<TransferProgress
									onNavigateBack={HandleNavigationBack}
									transferStatus={{
										deviceName: transferStatus.deviceName,
										status: transferStatus.status,
									}}
								/>
							) : (
								<div>
									<ThisDevice />
									<DiscoveredDevices />
								</div>
							)}
						</div>
					) : (
						!transferStatus.started && <Settings />
					)}
				</Container>
			</main>
		</ErrorBoundary>
	);
}
