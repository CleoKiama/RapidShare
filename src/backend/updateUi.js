import formatBytes from "./formatBytes.js";
import mainWindowSetup from "./mainWindowSetup.js";

class UpdateUi {
	onTransferStart(username) {
		const { webContents } = mainWindowSetup.browserWindowRef();
		webContents.send("transferring", {
			started: true,
			sendingTo: username,
		});
	}
	onTransferEnd(username) {
		const { webContents } = mainWindowSetup.browserWindowRef();
		webContents.send("transferring", {
			started: false,
			sendingTo: username,
		});
	}
	onError(error) {
		const { webContents } = mainWindowSetup.browserWindowRef();
		webContents.send("error", error);
	}
	updateDevices(foundDevices) {
		const browserWindow = mainWindowSetup.browserWindowRef();
		const MAX_RETRY_TIME = 2000;
		const RETRY_INTERVAL = 200;

		if (browserWindow?.webContents) {
			browserWindow.webContents.send("updateDevices", foundDevices);
			return;
		}

		let retryInterval;
		const cleanup = () => clearInterval(retryInterval);

		retryInterval = setInterval(() => {
			if (browserWindow?.webContents) {
				browserWindow.webContents.send("updateDevices", foundDevices);
				cleanup();
			}
		}, RETRY_INTERVAL);

		setTimeout(cleanup, MAX_RETRY_TIME);
	}
	updateProgress(percentageProgress, bytesTransferred) {
		const { webContents } = mainWindowSetup.browserWindowRef();
		webContents.send("fileProgress", {
			percentageProgress: percentageProgress,
			bytesTransferred: formatBytes(bytesTransferred),
		});
	}
}

export default new UpdateUi();
