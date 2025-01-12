import formatBytes from "./formatBytes.js";
import mainWindowSetup from "./mainWindowSetup.js";

class UpdateUi {
	onTransferStart(username, status) {
		const { webContents } = mainWindowSetup.browserWindowRef();
		webContents.send("transferring", {
			started: true,
			deviceName: username,
			status: status,
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

		if (browserWindow?.webContents) {
			if (browserWindow.webContents.isLoading()) {
				browserWindow.webContents.once("did-finish-load", () => {
					browserWindow.webContents.send("updateDevices", foundDevices);
				});
			} else {
				browserWindow.webContents.send("updateDevices", foundDevices);
			}
		}
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
