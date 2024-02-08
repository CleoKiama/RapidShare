import { createSocket } from "node:dgram";
import c from "ansi-colors";
import multiplexer from "./multiplexer.js";
import { PassThrough } from "node:stream";
import { deviceDiscovery } from "./broadCast.js";
import thisMachineAddress from "./currentAssignedAddress.js";
import createMulticastServer from "./multicastListener.js";
import { createReadStream } from "node:fs";
import identifyPath from "./pathType.js";
import { error } from "node:console";
import { createPacket } from "./multiplexer.js";
const address = thisMachineAddress();
const port = 3000;

const multicastServer = createMulticastServer();
const server = createSocket("udp4");
server.on("error", (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
  process.exit(1);
});

server.bind(port, address, () => {
  console.log(c.blueBright(`server listening on ${address}:${port}`));
});

async function getClientAddress() {
  if (process.env.NODE_ENV === "test") {
    return {
      address: address,
      port: port,
    };
  }
  return new Promise((resolve) => {
    deviceDiscovery.once("deviceFound", (address, username) => {
      resolve({
        address: address,
        username: username,
        port: process.env.NODE_ENV === "test" ? 4000 : 3000,
      });
    });
  });
}
async function returnFileStream(rootPath, destination) {
  return new Promise((resolve, reject) => {
    const fileStream = createReadStream(rootPath);
    fileStream.on("data", (data) => {
      destination.write(createPacket(rootPath, data));
    });
    fileStream.once("end", () => {
      if (destination.writable) return destination.end();
      resolve();
    });
    fileStream.on(error, reject);
  });
}

export default async function main(rootPath) {
  try {
    //!the address and the port could be undefined before the getClientAddress resolves
    const { address, port, username } = await getClientAddress();

    const io = new PassThrough();
    io.on("data", (data) => {
      server.send(data, port, address);
    });
    io.on("end", () => {
      console.log(
        `multiplexing done sending the end event to the udp client now ...`
      );
      server.send("end", port, address, (err) => {
        if (err) throw new Error(err);
        server.close();
        multicastServer.close();
      });
    });
    //! the isDir could be undefined before this promise resolves
    const { isDir } = await identifyPath(rootPath);
    console.log(c.green(`sending file to userName: ${username}`));
    isDir
      ? await multiplexer(rootPath, io)
      : await returnFileStream(rootPath, io);
  } catch (error) {
    console.error(`something went wrong error : ${error.message}`);
    server.close();
    multicastServer.close();
    process.exit(1);
  }
}

export { server };

const rootPath = process.argv[2];
if (rootPath) {
  console.log(
    c.blueBright(`starting sharing the file with path : ${rootPath}`)
  );
  main(rootPath)
    .then(() => console.log("all done"))
    .catch((error) => {
      console.error(c.red(`error : ${error.message}`));
    });
} else console.log(`rootPath is undefined :${rootPath}`);
