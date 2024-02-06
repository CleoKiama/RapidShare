import { createSocket } from "dgram";
import Demultiplexer from "./demultiplexer.js";
import { PassThrough } from "stream";
import thisMachineAddress from "./currentAssignedAddress.js";
import createMulticastServer from "./multicastListener.js";

const  multicastSocket = createMulticastServer()
const address = thisMachineAddress();
const port = process.env.NODE_ENV === "test" ? 4000 : 3000;

const socket = createSocket("udp4");
socket.bind(port, address, (error) => {
  if (error) {
    console.error(`error binding to port 4000`);
    throw error;
  }
});

async function main() {
  const io = new PassThrough();
  try {
    let awaitDemultiplexing = Promise.resolve(Demultiplexer(io));
    socket.on("message", (msg) => {
      if (msg.toString() === "end") {
        return io.end();
      }
      io.write(msg);
    });

    await awaitDemultiplexing;
  } catch (error) {
    io.end();
  }
}

main()
  .then(() => {
    socket.close();
    multicastSocket.close()
  })
  .catch((error) => {
    console.error(error.message);
    socket.close();
  });

export { socket };
