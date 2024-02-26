import c from "ansi-colors";
import multiplexer from "./multiplexer.js";
import { deviceDiscovery } from "./broadCast.js";
import thisMachineAddress from "./currentAssignedAddress.js";
import Demultiplexer from "./demultiplexer.js";
import { createReadStream } from "node:fs";
import identifyPath from "./pathType.js";
import { createPacket } from "./multiplexer.js";
import { createServer, createConnection } from "net";
import createMulticastServer from "./multicastListener.js";

// !! might need to close the multicastServer for the terminal version when done I guess
export const multicastServer = createMulticastServer();

const address = thisMachineAddress();
const port = 3000;

function startServer() {
  const serverSocket = createServer({
    keepAlive: true,
  });
  serverSocket.listen(
    {
      host: address,
      port: port,
    },
    () => {
      console.log(c.green(`tcp server ready on ${address} and ${port}`));
    }
  );
  return serverSocket;
}

export const serverSocket = startServer();

//TODO set up the demux to handle transfer if any from any of the peers by setting up  an on connect event handler
async function getClientAddress() {
return new Promise((resolve) => {
    deviceDiscovery.once("deviceFound", ({address,username,port}) => {
      resolve({
        clientAddress: address,
        clientUsername: username,
        clientPort : port
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
    fileStream.on("error", reject);
  });
}
 
async function establishConnection(clientPort, clientAddress) {
  return new Promise((resolve, reject) => {
    let clientSocket = createConnection(clientPort, clientAddress, () => {
      console.log(
        c.green(
          `connection established to peer on ${clientPort} adr  :${clientAddress} `
        )
      );
      resolve(clientSocket);
    });
    clientSocket.once("error",(error) => {
      console.log(`error establishing a connection ${error.message}`);
      reject(error);
    });
  });
}

export async function receiveMode() {
  return new Promise((resolve, reject) => {
    serverSocket.once("connection", async (peerSocket) => {
      Demultiplexer(peerSocket).then(resolve, reject);
    });
  });
}

export default async function transferFiles(rootPath) {
  const { clientAddress, clientPort, clientUsername } =  await getClientAddress();
    console.log(c.blue("establishing a connection to peer"))
  const peerSocket = await establishConnection(clientPort, clientAddress);

  try {
    const { isDir } = await identifyPath(rootPath);
    console.log(c.green(`sending file to userName: ${clientUsername}`));
    isDir
      ? await multiplexer(rootPath, peerSocket)
      : await returnFileStream(rootPath, peerSocket);
  } catch (error) {
    console.error(`something went wrong error : ${error.message}`);
  }
}
