import React from "react";
import App from "../app.jsx";
import { render } from "@testing-library/react";
import { EventEmitter } from "node:events";
import os from "os";
import userEvent from "@testing-library/user-event";
import { act } from "@testing-library/react";

const transferringPayload = {
	started: true,
	sendingTo: "PcTwo",
};

test("cancels the transfer of files", async () => {
	const ipcHandleSpy = jest.fn(async () => {
		return;
	});
	const user = userEvent.setup();
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
			} else if (channel === "cancelTransfer") {
				return ipcHandleSpy();
			}
			return { devices: [] };
		},
	};
	const { findByText } = render(<App />);
	await act(async () => {
		transferMonitor.emit(
			"transferring",
			{
				eventid: "1234142jIJ$%",
			},
			transferringPayload,
		);
	});
	const initCancelBtn = await findByText("Cancel");
	expect(initCancelBtn).toBeInTheDocument();
	await act(async () => {
		await user.click(initCancelBtn);
	});
	const confirmDeleteBTN = await findByText("Yes, Cancel Transfer");
	expect(confirmDeleteBTN).toBeInTheDocument();
	await act(async () => {
		await user.click(confirmDeleteBTN);
	});
	expect(ipcHandleSpy).toHaveBeenCalled();
});

test("attaches the listener to revert back the ui after a cancel", async () => {
	const ipcHandleSpy = jest.fn(async () => {
		return;
	});
	const user = userEvent.setup();
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
			} else if (channel === "cancelTransfer") {
				return ipcHandleSpy();
			}
			return { devices: [] };
		},
	};
	const { findByText, findByAltText } = render(<App />);
	await act(async () => {
		transferMonitor.emit(
			"transferring",
			{
				eventid: "1234142jIJ$%",
			},
			transferringPayload,
		);
	});
	const initCancelBtn = await findByText("Cancel");
	await act(async () => {
		await user.click(initCancelBtn);
	});
	const confirmDeleteBTN = await findByText("Yes, Cancel Transfer");
	await act(async () => {
		await user.click(confirmDeleteBTN);
	});
	const arrowBack = await findByAltText("navigate back");
	expect(arrowBack).toBeInTheDocument();
	await act(async () => {
		transferMonitor.emit(
			"transferring",
			{
				eventid: "1234142jIJ$%",
			},
			transferringPayload,
		);
	});
	expect(arrowBack).not.toBeInTheDocument();
});
