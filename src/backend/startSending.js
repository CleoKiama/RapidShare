import transferFiles, { cancel } from "./sendFiles.js";
import c from 'ansi-colors'
import updateUi from "./updateUi.js";
import BonjourDeviceDiscovery from "./bonjourDeviceDiscovery.js";
import { ipcMain } from "electron";
import TransferProgress from "./transferProgress.js";

export default async function startSend(filePaths, addressToMatch) {
  const { address, port } = BonjourDeviceDiscovery
    .getfoundDevices().devices.find((device) => device.address === addressToMatch)
  const handleCancel = () => {
    cancel()
  }
  ipcMain.handleOnce("cancelTransfer", handleCancel)
  try {
    updateUi.onTransferStart()
    await transferFiles(filePaths, port, address)
    updateUi.onTransferEnd()
    TransferProgress.cleanUp()
    ipcMain.removeHandler("cancelTransfer", handleCancel)
  } catch (error) {
    console.error(c.red(`error sending files ${error.message}`))
    //TODO error handling module
  }
}

