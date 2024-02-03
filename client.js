import { createSocket } from "dgram";
import Demultiplexer from "./demultiplexer.js";
import { PassThrough } from "stream";
import c from "ansi-colors";
const address = "localhost";
const port = 4000;

const socket = createSocket("udp4");
socket.bind(port, address, (error) => {
  if (error) {
    console.error(`error binding to port 4000`);
    throw error;
  }
  console.log(`client listening on ${address}:${port}`);
});

async function main() {
  const io = new PassThrough();
  try {
    let awaitDemultiplexing = Promise.resolve(Demultiplexer(io));
    socket.on("message", (msg, rinfo) => {
      if (msg.toString() === "end") {
        console.log(c.cyanBright("end event received closing the udp server"));
        return io.end();
      }
      io.write(msg);
    });

    console.log("waiting for demultiplexing to finish");
    await awaitDemultiplexing;
    console.log(c.greenBright("demultiplexing finished"));
  } catch (error) {
    console.error(error.message);
    io.end();
  }
}

main()
  .then(() => {
    console.log(
      c.greenBright("client's main all done exiting closing the socket now")
    );
    socket.close();
  })
  .catch((error) => {
    console.error(error.message);
    socket.close();
  });

export { socket };
