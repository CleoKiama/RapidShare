import Demultiplexer from "./demultiplexer.js";
import c from 'ansi-colors'
import updateUi from "./updateUi.js";
import TransferServer from './transferInterface.js'
import transferProgress from "./transferProgress.js";
import { ipcMain } from "electron";

export default async function startWrite(socket) {
  // Todo errror handling logic here 
  ipcMain.handleOnce('cancelTransfer', () => {
    socket.destroy({
      code: "ABORT_ERR"
    })
  })
  updateUi.onTransferStart()
  console.log(c.green("waiting for demux to finish...."))
  Demultiplexer(socket, (error) => {
    if (error) {
      console.log(c.red("something went wrong with the dmux error below"))
      updateUi.onError(error)
    } else {
      updateUi.onTransferEnd()
    }
    transferProgress.cleanUp()
    TransferServer.addConnectionListener()
    console.log('demux all done')
  })
}
