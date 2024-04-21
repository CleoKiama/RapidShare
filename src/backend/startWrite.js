import Demultiplexer from "./demultiplexer.js";
import c from 'ansi-colors'
import updateUi from "./updateUi.js";
import TransferServer from './transferInterface.js'
import transferProgress from "./transferProgress.js";

export default async function startWrite(socket) {
  //Todo errror handling logic here 
  try {
    updateUi.onTransferStart()
    await Demultiplexer(socket)
    socket.end()
    updateUi.onTransferEnd()
    transferProgress.cleanUp()
    TransferServer.addConnectionListener()
  } catch (error) {
    console.error(c.red(`something went wrong demuxing ${error.message}`))
  }
}

