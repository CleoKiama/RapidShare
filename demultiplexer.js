import c from "ansi-colors";
import fs from "fs-extra";

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

      const contentBuffer = Buffer.alloc(chunk.length - pathLength - 1);
      chunk.copy(contentBuffer, 0, 1 + pathLength, chunk.length);
        writingOperations++;
        createFS(currentPath, contentBuffer).then(() => {
          if (--writingOperations === 0 && source.readableEnded) {
            //fs.ensureDir('/app/emptyDir').then(resolve)
            console.log(
              c.blue(`${writingOperations} write operations ending the demux `)
            );
            resolve();
          }else if(writingOperations<=0) {
            source.setEncoding('utf8')
             let remainingChunk = source.read() 
             while (remainingChunk!==null) {
              remainingChunk = source.read()
              console.log(`remaining chunk ${remainingChunk}`)
             }
            console.log(
              c.blue(`source.readableEnded false and source.readable :  ${source.readable} but : ${writingOperations} write operations ending the demux `)
            );
            resolve();
          }
        })
        .catch(reject);
     
      currentLength = null;
      currentPath = null;
    });
    source.on("error", reject);
    source.on(`end`,()=>{
      c.greenBright(`source.readableEnded true with :  ${writingOperations} write operations ending the demux `)
    })
  });
}
