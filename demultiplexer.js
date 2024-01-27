import c from "ansi-colors";
import fs from 'fs-extra'
async function createFS(path, buffer) {
  await fs.ensureFile(path);
  await fs.writeFile(path, buffer);
}

export default function Demultiplexer(source) {
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
      const contentBuffer = Buffer.alloc(chunk.length - pathLength-1);
      chunk.copy(contentBuffer, 0, 1 + pathLength, chunk.length);
      try {
        writingOperations++;
        createFS(currentPath, contentBuffer).then(() => {
          if (++writingOperations && source.readableEnded) {
            //fs.ensureDir('/app/emptyDir').then(resolve)
             resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
      currentLength = null;
      currentPath = null;
    });

    source.on("end", () => {
      console.log(
        c.blue(
          `source reading end event now waiting for ${writingOperations} write operation to finish `
        )
      );
    });
    source.on("error", reject);
  });
}
