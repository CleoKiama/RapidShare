import React from "react";
import { render } from "@testing-library/react";
import { EventEmitter } from "node:events";
import TransferProgress from "../components/transferProgress.jsx";
import { act } from "@testing-library/react";
import os from "node:os";
import App from "../app.jsx";

const deviceName = "pcTwo";

test("transfer Progress updates the ui on transfer start", async () => {
	const fileProgress = new EventEmitter();
	const onNavigateBack = jest.fn();
	window.electron = {
		on: (channel, callback) => {
			fileProgress.on(channel, callback);
		},
		removeListener: (channel, callback) => {
			fileProgress.removeListener(channel, callback);
		},
	};
	const { findByText } = render(
		<TransferProgress
			onNavigateBack={onNavigateBack}
			transferStatus={{
				started: true,
				status: "sending",
				deviceName,
			}}
		/>,
	);
	await act(async () => {
		fileProgress.emit(
			"fileProgress",
			{
				eventid: "1234142jIJ$%",
			},
			{
				percentageProgress: 50,
				bytesTransferred: "500mib",
			},
		);
	});
	const pTag = await findByText("500mib", {
		timeout: 1000,
	});
	expect(pTag).toBeInTheDocument();
});

test("reverts back the ui once the transfer is canceled from the other device", async () => {
	const ipcMain_mock = new EventEmitter();
	window.electron = {
		on: (channel, callback) => {
			ipcMain_mock.on(channel, callback);
		},
		removeListener: (channel, callback) => {
			ipcMain_mock.removeListener(channel, callback);
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
	const { findByAltText, findByText } = render(<App />);
	await act(async () => {
		ipcMain_mock.emit(
			"transferring",
			{
				eventid: "1234142jIJ$%",
			},
			{
				started: true,
				deviceName,
				status: "sending",
			},
		);
	});
	const statusMessage = await findByText(/sending files/, {
		timeout: 800,
	});
	expect(statusMessage).toBeInTheDocument();
	//now the other device cancels the progress
	await act(async () => {
		ipcMain_mock.emit(
			"error",
			{
				eventid: "1234142jIJ$%",
			},
			{
				code: "ABORT_ERR",
				message: "transfer canceled",
			},
		);
	});
	const arrowBack = await findByAltText("navigate back");
	expect(arrowBack).toBeInTheDocument();
});

test("is able to restart the file transfer after a cancel and update the ui accordingly", async () => {
	const ipcMain_mock = new EventEmitter();
	window.electron = {
		on: (channel, callback) => {
			ipcMain_mock.on(channel, callback);
		},
		removeListener: (channel, callback) => {
			ipcMain_mock.removeListener(channel, callback);
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
	const { findByAltText, findByText } = render(<App />);
	const transferringPayload = { started: true, deviceName, status: "sending" };
	await act(async () => {
		ipcMain_mock.emit(
			"transferring",
			{
				eventid: "1234142jIJ$%",
			},
			transferringPayload,
		);
	});
	const statusMessage = await findByText(/sending files/, {
		timeout: 800,
	});
	expect(statusMessage).toBeInTheDocument();
	//now the other device cancels the progress
	await act(async () => {
		ipcMain_mock.emit(
			"error",
			{
				eventid: "1234142jIJ$%",
			},
			{
				code: "ABORT_ERR",
				message: "transfer canceled",
			},
		);
	});
	const arrowBack = await findByAltText("navigate back");
	expect(arrowBack).toBeInTheDocument();
	await act(async () => {
		ipcMain_mock.emit(
			"transferring",
			{
				eventid: "1234142jIJ$%",
			},
			transferringPayload,
		);
	});
	const sendStatus = await findByText(/sending files/);
	expect(sendStatus).toBeInTheDocument();
});
