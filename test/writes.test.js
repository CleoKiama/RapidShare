import { createReadStream } from "node:fs";
import c from "ansi-colors";
import fs from "fs-extra";
import { Transform } from "node:stream";
import Demultiplexer from "../demultiplexer.js";
import formatBytes from "../formatBytes.js";
function createPacket(path, chunk) {
  if (chunk === null) {
    const pathBuffer = Buffer.from(path);
    const packet = Buffer.alloc(4 + 1 + pathBuffer.length);
    packet.writeUInt32BE(1 + pathBuffer.length, 0);
    packet.writeUInt8(pathBuffer.length, 4);
    pathBuffer.copy(packet, 5, 0, pathBuffer.length);
    return packet;
  }
  const pathBuffer = Buffer.from(path);
  const packet = Buffer.alloc(4 + 1 + pathBuffer.length + chunk.length);
  packet.writeUInt32BE(1 + pathBuffer.length + chunk.length, 0);
  packet.writeUInt8(pathBuffer.length, 4);
  pathBuffer.copy(packet, 5, 0, pathBuffer.length);
  chunk.copy(packet, 5 + pathBuffer.length, 0, chunk.length);
  return packet;
}

class packetCreator extends Transform {
  constructor() {
    super();
    this.path = "/copy.jpg";
  }
  _transform(chunk, encoding, callback) {
    const packetBuf = createPacket(this.path, chunk);
    this.push(packetBuf);
    callback();
  }
  _flush(callback) {
    const message = "all done";
    const messageBuffer = Buffer.from(message);
    this.push(createPacket(this.path, messageBuffer));
    callback();
  }
}
beforeEach(async () => {
  try {
    await fs.rm("/media/cleo/Library/copy.jpg");
  } catch (error) {
    console.error(
      c.blue("i think the file does not exist but it's fine anyway")
    );
  }
});

test("reads and writes a full copy of a file", async () => {
  const path = "/home/cleo/Pictures/BingWallpaper/four.jpg";
  const destinationPath = "/media/cleo/Library/copy.jpg";
  const { size } = await fs.stat(path);
  const packetCreatorInstance = new packetCreator();
  const awaitDemux = Promise.resolve(Demultiplexer(packetCreatorInstance));
  const stream = createReadStream(path, {
    highWaterMark: 60 * 1024,
  });
  stream.pipe(packetCreatorInstance).on("error", (err) => {
    console.error(c.red(`error piping to the transform ${err.message}`));
  });
  await awaitDemux;
  const stat = await fs.stat(destinationPath);
  const formatedBytes = formatBytes(stat.size);
  const finalSize = formatBytes(size)
  expect(formatedBytes).toEqual(finalSize);
});