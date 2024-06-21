import Demultiplexer from "./demultiplexer.js";
import TransferServer from './transferInterface.js'
import transferProgress from "./transferProgress.js";
import { ipcMain } from "electron";
import updateUi from "./updateUi.js";

export default async function startWrite(socket) {
  // Todo errror handling logic here 
  const handleCancel = () => {
    socket.destroy({
      code: "ABORT_ERR"
    })
  }
  ipcMain.handle('cancelTransfer', handleCancel)
  updateUi.onTransferStart()
  Demultiplexer(socket, (error) => {
    if (error) {
      updateUi.onError(error)
    } else {
      updateUi.onTransferEnd()
    }
    transferProgress.cleanUp()
    TransferServer.addConnectionListener()
    ipcMain.removeHandler("cancelTransfer", handleCancel)
  })
}
