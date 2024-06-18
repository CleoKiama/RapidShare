import transferFiles from "./sendFiles.js";
import updateUi from "./updateUi.js";
import BonjourDeviceDiscovery from "./bonjourDeviceDiscovery.js";
import { ipcMain } from "electron";
import TransferProgress from "./transferProgress.js";

export default async function startSend(filePaths, addressToMatch) {
  const controller = new AbortController()
  // test phase 
  const { address, port } = BonjourDeviceDiscovery
    .getfoundDevices().devices.find((device) => device.address === addressToMatch)
  const handleCancel = () => {
    controller.abort()
  }
  ipcMain.handleOnce("cancelTransfer", handleCancel)
  try {
    updateUi.onTransferStart()
    await transferFiles(filePaths, port, address, controller)
    updateUi.onTransferEnd()
    TransferProgress.cleanUp()
  } catch (error) {
    updateUi.onError(error)
    //TODO error handling module
  } finally {
    ipcMain.removeHandler("cancelTransfer", handleCancel)
  }
}


