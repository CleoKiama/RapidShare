import transferFiles from "./sendFiles.js";
import updateUi from "./updateUi.js";
import BonjourDeviceDiscovery from "./bonjourDeviceDiscovery.js";
import { ipcMain } from "electron";
import TransferProgress from "./transferProgress.js";
import TransferServer from "./transferInterface.js";

export default async function startSend(filePaths, addressToMatch) {
	const controller = new AbortController();
	const { address, port, username } =
		BonjourDeviceDiscovery.getFoundDevices().devices.find(
			(device) => device.address === addressToMatch,
		);
	const handleCancel = () => {
		controller.abort();
	};
	ipcMain.handle("cancelTransfer", handleCancel);
	try {
		updateUi.onTransferStart(username, "sending");
		//prevent other connections while sending files
		TransferServer.removeConnectionListener();
		await transferFiles(filePaths, port, address, controller);
		updateUi.onTransferEnd(username);
		TransferProgress.cleanUp();
	} catch (error) {
		updateUi.onError(error);
		console.error(error.message);
	} finally {
		ipcMain.removeHandler("cancelTransfer", handleCancel);
		TransferServer.addConnectionListener();
	}
}
