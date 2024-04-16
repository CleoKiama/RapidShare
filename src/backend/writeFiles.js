import Demultiplexer from "./demultiplexer.js";
import c from 'ansi-colors'


export default async function startWrite(socket) {
  //Todo errror handling logic here 
  try {
    await Demultiplexer(socket)
    socket.end()

  } catch (error) {
    console.error(c.red(`something went wrong demuxing ${error.message}`))
  }
}
