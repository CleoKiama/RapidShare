import { createSocket } from "node:dgram";
import c from "ansi-colors";
import multiplexer from "./multiplexer.js";
import { PassThrough } from "node:stream";
const address = "localhost";
const port = 3000;

const server = createSocket("udp4");
server.on("error", (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
  process.exit(1);
});

server.bind(port, address, () => {
  console.log(c.blueBright(`server listening on ${address}:${port}`));
});


function getClientAddress() {
  return {
    address: "localhost",
    port: 4000,
  };
}
export default async function main(rootPath) {
  try {
    const { address, port } = getClientAddress();
    const io = new PassThrough();
    io.on("data", (data) => {
      server.send(data, port, address);
    });
    io.on("end", () => {
      console.log(`multiplexing done sending the end event to the udp client now ...`)
      server.send("end", port, address,(err)=>{
        if(err) throw new Error(err)
        server.close()
      });
    });
    await multiplexer(rootPath, io);
    
  } catch (error) {
    console.error(error.message);
  }
}

export { server };
