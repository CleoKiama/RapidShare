import React from "react";
import { render, act } from "@testing-library/react";
import { EventEmitter } from "node:events";
import App from "../app.jsx";
import os from "node:os";

test("renders the TransferFileProgress component on startTransfer", async () => {
	const transferMonitor = new EventEmitter();
	window.electron = {
		on: (channel, callback) => {
			transferMonitor.on(channel, callback);
		},
		removeListener: (channel, callback) => {
			transferMonitor.removeListener(channel, callback);
		},
		async invoke(channel) {
			if (channel === "thisDevice") {
				return {
					type: os.type(),
					userInfo: os.userInfo(),
				};
			}
			return { devices: [] };
		},
	};
	let thisDeviceSpy = jest.spyOn(window.electron, "invoke");
	const { findByText } = render(<App />);
	const deviceName = "thisDevice";
	const payload = {
		started: true,
		deviceName: deviceName,
		status: "sending",
	};
	await act(async () => {
		transferMonitor.emit(
			"transferring",
			{
				eventid: "1234142jIJ$%",
			},
			payload,
		);
	});
	const statusMessage = await findByText(/sending files/, {
		timeout: 950,
	});
	expect(thisDeviceSpy).toHaveBeenCalledWith("thisDevice");
	expect(statusMessage).toBeInTheDocument();
});

test("reverts  back the ui once the the transfer of files is done", async () => {
	const transferMonitor = new EventEmitter();
	window.electron = {
		on: (channel, callback) => {
			transferMonitor.on(channel, callback);
		},
		removeListener: (channel, callback) => {
			transferMonitor.removeListener(channel, callback);
		},
		async invoke(channel) {
			if (channel === "thisDevice") {
				return {
					type: os.type(),
					userInfo: os.userInfo(),
				};
			}
			return { devices: [] };
		},
	};
	let thisDeviceSpy = jest.spyOn(window.electron, "invoke");
	const { findByText } = render(<App />);
	let payload = {
		started: true,
		deviceName: "thisDevice",
		status: "receiving",
	};

	await act(async () => {
		transferMonitor.emit(
			"transferring",
			{
				eventid: "1234142jIJ$%",
			},
			payload,
		);
	});

	const statusMessage = await findByText(/receiving files/, {
		timeout: 800,
	});
	expect(statusMessage).toBeInTheDocument();
	payload = {
		started: false,
		deviceName: "thisDevice",
		status: "receiving",
	};
	await act(async () => {
		transferMonitor.emit(
			"transferring",
			{
				eventid: "1234142jIJ$%",
			},
			payload,
		);
	});
	expect(thisDeviceSpy).toHaveBeenCalledWith("thisDevice");
	expect(statusMessage).not.toBeInTheDocument();
});
