import createStreamSources from "./createFileStreams.js";
import GenerateFiles from "./generateFiles.js";
import c from "ansi-colors";
import GetRootSourcePath from "./rootSourcePath.js";
const rootSourcePath = GetRootSourcePath()

export function createPacket(path, chunk) {
    let finalPath
    let startIndex = path.indexOf(rootSourcePath)
    finalPath = path.substring(startIndex)
  if (chunk === null) {
    const pathBuffer = Buffer.from(finalPath);
    const packet = Buffer.alloc(4 + 1 + pathBuffer.length);
    packet.writeUInt32BE(1 + pathBuffer.length, 0);
    packet.writeUInt8(pathBuffer.length, 4);
    pathBuffer.copy(packet, 5, 0, pathBuffer.length);
    return packet;
  }
  const pathBuffer = Buffer.from(finalPath);
  const packet = Buffer.alloc(4 + 1 + pathBuffer.length + chunk.length);
  packet.writeUInt32BE(1 + pathBuffer.length + chunk.length, 0);
  packet.writeUInt8(pathBuffer.length, 4);
  pathBuffer.copy(packet, 5, 0, pathBuffer.length);
  chunk.copy(packet, 5 + pathBuffer.length, 0, chunk.length);
  return packet;
}

export default async function multiplexer(rootPath, destination) {
  try {
    const fileGenerator = new GenerateFiles(rootPath);
    const iterator = fileGenerator[Symbol.asyncIterator]();
    let iteratorResult = await iterator.next();
    while (!iteratorResult.done) {
      if (Object.hasOwn(iteratorResult.value, "empty")) {
        await sendEmptyDirPacket(iteratorResult.value.path, destination);
        iteratorResult = await iterator.next();
        continue;
      }
      await sendPacket(iteratorResult.value, destination);
      iteratorResult = await iterator.next();
    }
  } catch (error) {
    console.error(`error happened multiplexing  : ${error.message}`);
  }
  if (destination.writable) return destination.end();
}
const sendEmptyDirPacket = async (emptyDir, destination) => {
  return new Promise((resolve, reject) => {
    destination.write(createPacket(emptyDir, null), (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

async function sendPacket(files, destination) {
  let sources = createStreamSources(files);
  let pendingWritingOperations = 0;
  return new Promise((resolve, reject) => {
    while (files.length > 0) {
      const currentSource = sources.shift();
      const currentPath = files.shift();

      if (!currentPath) return;
      currentSource.on("readable",async function () {
        let chunk;
        while ((chunk = this.read()) !== null) {
          pendingWritingOperations++;
          let drain =  destination.write(createPacket(currentPath, chunk), (err) => {
            if (err) return reject(err);
            pendingWritingOperations -= 1;
          });
          if(!drain) {
            return new Promise (resolve=>{
               destination.once("drain",resolve)
            })
          }
        }
      });
      currentSource.on("error", (err) => {
        console.error(
          c.red(
            `error happened while reading file ${currentPath} : ${err.message}`
          )
        );
        reject(err);
      });
      currentSource.on("end", () => {
        const endOfFileMessage = "all done";
        destination.write(
          createPacket(currentPath, Buffer.from(endOfFileMessage)),
          (err) => {
            if (err) return reject(err);
            if (files.length === 0 && pendingWritingOperations === 0) {
            resolve();
          }
          }
        );
      });
    }
  });
}



