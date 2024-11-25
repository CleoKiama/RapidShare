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
	const [transferStart, setTransferStart] = useState(false);
	const [sendingTo, setSendingTo] = useState("");
	const [navState, setNavState] = useState("devices");
	useEffect(() => {
		const listener = (_, { started, deviceName }) => {
			setTransferStart(started);
			setSendingTo(deviceName);
		};
		window.electron.on("transferring", listener);
		return () => {
			window.electron.removeListener("transferring", listener);
		};
	}, []);
	const HandleNavigationBack = () => {
		setTransferStart(false);
	};
	const updateNav = (nav) => {
		setNavState(nav);
	};
	return (
		<ErrorBoundary fallbackRender={Fallback}>
			<main className="mx-auto h-screen  min-w-[474px]  rounded-2xl bg-grey-200 px-6 py-4">
				<h1 className="pl-4 font-semibold text-xl pb-1">RapidShare</h1>
				<Container>
					{!transferStart && (
						<Nav navState={navState} onNavUpdate={updateNav} />
					)}
					{navState === "devices" ? (
						<div className="pl-4">
							{transferStart ? (
								<TransferProgress
									onNavigateBack={HandleNavigationBack}
									sendingTo={sendingTo}
								/>
							) : (
								<div>
									<ThisDevice />
									<DiscoveredDevices />
								</div>
							)}
						</div>
					) : (
						!transferStart && <Settings />
					)}
				</Container>
			</main>
		</ErrorBoundary>
	);
}
