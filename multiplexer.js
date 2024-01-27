import createStreamSources from "./createFileStreams.js";
import GenerateFiles from "./generateFiles.js";
import c from "ansi-colors";
export function createPacket(path, chunk) {
  const pathBuffer = Buffer.from(path);
  const packet = Buffer.alloc(4 + 1 + pathBuffer.length + chunk.length);
  packet.writeUInt32BE(1 + pathBuffer.length + chunk.length, 0);
  packet.writeUInt8(pathBuffer.length, 4);
  pathBuffer.copy(packet, 5, 0, pathBuffer.length);
  chunk.copy(packet, 5 + pathBuffer.length, 0, chunk.length);
  return packet;
}
//TODO whenever it is an empty array of files then it an empty dir so just send with the chunk after the path as Null
export default async function multiplexer(rootPath, destination) {
  try {
    const fileGenerator = new GenerateFiles(rootPath);
    const iterator = fileGenerator[Symbol.asyncIterator]();
    let iteratorResult = await iterator.next();
    while (!iteratorResult.done) {
      if (Object.hasOwn(iteratorResult.value, "empty")) {
        console.log(
          c.red(`encountered an empty dir ${iteratorResult.value.path}`)
        );
        continue;
      }
      await sendPacket(iteratorResult.value, destination);
      iteratorResult = await iterator.next();
    }
  } catch (error) {
    console.error(`error happened multiplexing  : ${error.message}`);
  }
  if(destination.writable) {
    destination.end()
  }
}

async function sendPacket(files, destination) {
  let sources = createStreamSources(files);
  let pendingWritingOperations = 0;
  return new Promise((resolve, reject) => {
    while (files.length > 0) {
      const currentSource = sources.shift();
      const currentPath = files.shift();
      if (!currentPath) return;
      currentSource.on("readable", function () {
        let chunk;
        while ((chunk = this.read()) !== null) {
          const packet = createPacket(currentPath, chunk);
          destination.write(packet, (err) => {
            if (err) throw new Error(err.message);
            pendingWritingOperations -= 1;
          });
          ++pendingWritingOperations;
        }
      });
      currentSource.on("error", reject);
      currentSource.on("end", () => {
        if (files.length === 0&&pendingWritingOperations===0) {
          resolve();
        }
      });
    }
  });
}
