import transferFiles, { cancel } from "./sendFiles.js";
import updateUi from "./updateUi.js";
// import BonjourDeviceDiscovery from "./bonjourDeviceDiscovery.js";
import { ipcMain } from "electron";
import TransferProgress from "./transferProgress.js";

export default async function startSend(filePaths, addressToMatch) {
  // // test phase 
  // const { address, port } = BonjourDeviceDiscovery
  //   .getfoundDevices().devices.find((device) => device.address === addressToMatch)
  const handleCancel = () => {
    cancel()
  }
  ipcMain.handleOnce("cancelTransfer", handleCancel)
  try {
    updateUi.onTransferStart()
    await transferFiles(filePaths, 5000, '127.0.0.1')
    updateUi.onTransferEnd()
    TransferProgress.cleanUp()
    ipcMain.removeHandler("cancelTransfer", handleCancel)
  } catch (error) {
    updateUi.onError(error)
    ipcMain.removeHandler("cancelTransfer", handleCancel)
    //TODO error handling module
  }
}


