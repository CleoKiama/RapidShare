import Demultiplexer from "./demultiplexer.js";
import TransferServer from "./transferInterface.js";
import transferProgress from "./transferProgress.js";
import { ipcMain } from "electron";
import updateUi from "./updateUi.js";
import c from "ansi-colors";
import bonjourDeviceDiscovery from "./bonjourDeviceDiscovery.js";

export default async function startWrite(socket) {
	// Todo errror handling logic here
	const handleCancel = () => {
		socket.destroy({
			code: "ABORT_ERR",
		});
	};
	ipcMain.handle("cancelTransfer", handleCancel);
	//TODO: fix the status payload here for receiving files
	let deviceName = "";
	const { address } = socket.address();
	for (const device of bonjourDeviceDiscovery.getFoundDevices().devices) {
		if (device.address === address) {
			deviceName = device.username;
			break;
		}
	}
	updateUi.onTransferStart(deviceName, "receiving");
	Demultiplexer(socket, (error) => {
		if (error) {
			updateUi.onError(error);
			console.error(error.message);
			socket.destroy(error);
		} else {
			updateUi.onTransferEnd();
		}
		transferProgress.cleanUp();
		TransferServer.addConnectionListener();
		ipcMain.removeHandler("cancelTransfer", handleCancel);
	});
}
