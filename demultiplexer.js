import c from "ansi-colors";
import DestinationResolver from "./destinationResolver.js";
export default async function Demultiplexer(source) {
  let DestinationResolverInstance = new DestinationResolver();
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
        console.log(`waiting for more data`);
        return null;
      }
      chunk = source.read(currentLength);
      if (chunk === null) {
        console.log(`waiting for more data`);
        return null;
      }
      let pathLength = chunk.readUInt8(0);
      currentPath = chunk.toString("utf8", 1, 1 + pathLength);
      let contentBuffer = Buffer.alloc(chunk.length - pathLength - 1);
      if (contentBuffer.length === 0) {
        contentBuffer = null;
      } else chunk.copy(contentBuffer, 0, 1 + pathLength, chunk.length);
      writingOperations++;
      DestinationResolverInstance
        .saveToFileSystem(currentPath, contentBuffer)
        .then(() => {
          if (--writingOperations === 0 && source.readableEnded) resolve();
        }).catch(error=>{
          console.error(c.red(`error writing ${error.message}`))
        })
      currentLength = null;
      currentPath = null;
    });
    source.on("error", (err) => {
      console.log(c.red(`erro from demux from source.on(err) ${err.message} `));
      reject(err.message);
    });
    source.on("end", () => {
      if (writingOperations === 0) return resolve();
    });
  });
}
//TODO start here future cleo start by doing the manual write stream without involving the dynamic path usage and see if we still get the full data
