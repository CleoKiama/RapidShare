
import { createSocket } from "dgram";
import Demultiplexer from "./demultiplexer.js";
import { PassThrough } from "stream";

const address = "localhost";
const port = 4000;

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
  })
  .catch((error) => {
    console.error(error.message)
    socket.close();
  });

export { socket };
