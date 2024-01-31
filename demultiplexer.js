import fs from "fs-extra";

async function createFS(path, buffer) {
  if (buffer === null) return await fs.ensureDir(path);
  await fs.writeFile(path, buffer);
}

export default async function Demultiplexer(source) {
  let writingOperations = 0;
  return new Promise((resolve, reject) => {
    let currentLength = null;
    let currentPath = null;
    source.on("readable", () => {
      let chunk;
      if (currentLength === null) {
        chunk = source.read(4);
        currentLength = chunk && chunk.readUInt32BE(0);
      }
      if (currentLength === null) {
        return null;
      }
      chunk = source.read(currentLength);
      if (chunk === null) {
        return null;
      }
      let pathLength = chunk.readUInt8(0);
      currentPath = chunk.toString("utf8", 1, 1 + pathLength);
      let contentBuffer = Buffer.alloc(chunk.length - pathLength - 1);
      if (contentBuffer.length === 0) {
        contentBuffer = null;
      } else chunk.copy(contentBuffer, 0, 1 + pathLength, chunk.length);

      writingOperations++;
      createFS(currentPath, contentBuffer)
        .then(() => {
          //!this might never exit if the readable event never fires like it happened in the test case using a passThrough stream
          if (--writingOperations === 0 && source.readableEnded) resolve();
        })
        .catch(reject);
      currentLength = null;
      currentPath = null;
    });
    source.on("error", (err) => {
      console.log(err.message);
      reject(err.message);
    });
    source.on("end", () => {
      if (writingOperations === 0) return resolve();
    });
  });
}
