import Demultiplexer from "./demultiplexer.js";
import c from 'ansi-colors'
import WindowAndListenerSetup from './mainWindowSetup.js'

export default async function startWrite(socket) {
  //Todo errror handling logic here 
  try {
    onWriteStart()
    await Demultiplexer(socket)
    socket.end()
    onWriteEnd()

  } catch (error) {
    console.error(c.red(`something went wrong demuxing ${error.message}`))
  }
}

const onWriteStart = function() {
  WindowAndListenerSetup.returnWebContents().send('transferStart', true)
}

const onWriteEnd = function() {
  WindowAndListenerSetup.returnWebContents().send('transferEnd', false)
}
