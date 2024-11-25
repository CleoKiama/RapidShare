import React from "react";
import EventEmitter from "events";
import App from "../app.jsx";
import { act, render } from "@testing-library/react";
import os from "os";

test("changes to the transfer ui when a transfer request comes in", async () => {
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
	const { findByText } = render(<App />);
	await act(async () => {
		transferMonitor.emit(
			"transferring",
			{
				eventid: "1234142jIJ$%",
			},
			{
				started: true,
				sendingTo: "PcTwo",
			},
		);
	});
	const statusMessage = await findByText(/sending files/, {
		timeout: 950,
	});

	expect(statusMessage).toBeInTheDocument();
});
