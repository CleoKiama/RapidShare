import fs from "fs-extra";
import lazystream from "lazystream";
import { createWriteStream } from "fs";
const incomingFiles = new Map();
 // * mock process.argv2 value 
process.env.NODE_ENV === "test" && (process.argv[2] = "/newVolume/")

async function writeFilesAndFolders(path, buffer) {
   // ** check to see if the path separator's are fine
   const finalPath = `${process.argv[2]}${path}` 
  return new Promise((resolve, reject) => {
    if (buffer === null) return fs.ensureDir(finalPath).then(resolve, reject);
    if (incomingFiles.has(finalPath)) {
      if (buffer.toString() === "all done") {
        incomingFiles.get(finalPath).end = true;
        incomingFiles.get(finalPath).file.end();
        return resolve();
      }
      const { file, end } = incomingFiles.get(finalPath);
      file.write(buffer, (err) => {
        if (err) return reject(err);
        //** what if there is a pending write operation in the internal buffer and we're closing the stream */
        end && file.end();
        resolve();
      });
    } else if (buffer.toString() === "all done") {
      return fs.ensureFile(finalPath).then(resolve, reject);
    }
       fs.ensureFile(finalPath).then(()=>{
    var options = {
      start: 0,
    }
     
    incomingFiles.set(finalPath, {
      file: new lazystream.Writable(() => {
        return createWriteStream(finalPath,options);
      }),
      end: false,
    });
    const { file, end } = incomingFiles.get(finalPath);
    // ** handle the drain overflow check if it is needed
    file.write(buffer, (err) => {
      if (err) return reject(err);
      end && file.end();
      resolve();
    });

       })
  });
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
      writeFilesAndFolders(currentPath, contentBuffer)
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
