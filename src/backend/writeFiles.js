import Demultiplexer from "./demultiplexer.js";



export default async function startWrite(socket) {
  await Demultiplexer(socket)
  socket.end()
}
