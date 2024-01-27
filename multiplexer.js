import createStreamSources from "./createFileStreams.js";
import GenerateFiles from "./generateFiles.js";
import c from "ansi-colors";
export function createPacket(path, chunk) {
  console.log(path);
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
  // TODO change this to use the generate files generator
  const fileGenerator = new GenerateFiles(rootPath);
  const iterator = fileGenerator[Symbol.asyncIterator]();
  let iteratorResult = await iterator.next();
  const concurrency = 4;
  let running = 0;
  const filesPaths = [];
  const sources = [];
  //TODO edge case where the initial dir could be empty thus value = []
  const readMoreFiles = async () => {
    if (filesPaths.length <= 4 && !iteratorResult.done) {
      console.log(c.yellow(`reading more files`));
      
      filesPaths.push(...iteratorResult.value);
      let lazyFileStreams = createStreamSources(filesPaths);
      sources.push(...lazyFileStreams);
      iteratorResult = await iterator.next();
      console.log(filesPaths);
    } else {
      console.log(
        c.green(
          `not adding more files as filesPaths.length is :${filesPaths.length}`
        )
      );
    }
  };
  const readSources = async (concurrency) => {
    await readMoreFiles()
    while (running < concurrency && filesPaths.length > 0) {
      const currentSource = sources.shift();
      const currentPath = filesPaths.shift();
      //TODO take care of the situation where we have an empty files thus chunk might be null
      currentSource.on("readable", function () {
        let chunk;
        while ((chunk = this.read()) !== null) {
          const packet = createPacket(currentPath, chunk);
          destination.write(packet);
        }
      });
      currentSource.on("error", (error) => {
        console.error(
          `error reading a stream source:${currentPath} error : ${error.message}`
        );
      });
      currentSource.on("end", async () => {
        running -= 1;

        if (!iteratorResult.done) {
         await readSources(concurrency);
        } else if (running === 0 && destination.writable) {
          destination.end(() => {
            console.log(`stream multiplexing ended with running ${running}`);
          });
        }
      });

      running++;
    }
  };

  await readSources(concurrency);
}
