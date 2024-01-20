import createStreamSources from "./createFileStreams.js";
import { returnFiles } from "./readFilesSize.js";

export function createPacket(path, chunk) {
  const pathBuffer = Buffer.from(path);
  const packet = Buffer.alloc(4 + 1 + pathBuffer.length + chunk.length);
  packet.writeUInt32BE(1 + pathBuffer.length + chunk.length, 0);
  packet.writeUInt8(pathBuffer.length, 4);
  pathBuffer.copy(packet, 5, 0, pathBuffer.length);
  chunk.copy(packet, 5 + pathBuffer.length, 0, chunk.length);
  return packet;
}

export default async function multiplexer(rootPath, destination) {
  const filesPath = await returnFiles(rootPath);
  const sources = createStreamSources(filesPath);
  const concurrency = 3;
  let running = 0;
  const readSources = (concurrency) => {
    while (running < concurrency) {
      const currentSource = sources.shift();
      const currentPath = filesPath.shift();
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
      currentSource.on("end", () => {
        running -= 1;
        if (sources.length > 0) {
          readSources(concurrency);
        } else {
          if (destination.writable) {
            destination.end(() => {
              console.log("stream multiplexing ended ");
            });
          }
        }
      });

      running++;
    }
  };

  readSources(concurrency);
}
