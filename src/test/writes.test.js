import { createReadStream } from "node:fs";
import c from "ansi-colors";
import fs from "fs-extra";
import { Transform } from "node:stream";
import Demultiplexer from "../backend/demultiplexer.js";
import formatBytes from "../backend/formatBytes.js";
import {config} from '../backend/appConfig.js'

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

//add the name for the file to be tested here
const fileName = "copy.jpg"
class demuxInitializer extends Transform {
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
    await fs.rm(`${config.destinationPath}/${fileName}`);
  } catch (error) {
    console.error(
      c.blue("i think the file does not exist but it's fine anyway")
    );
  }
});

test("reads and writes a full copy of a file", async () => {
  //Path to the fileName to test  that will be transferred
  const path = "/home/cleo/Pictures/BingWallpaper/copy.jpg";
  const { size } = await fs.stat(path);
  const demuxInitializerInstance = new demuxInitializer();
  const awaitDemux = Promise.resolve(Demultiplexer(demuxInitializerInstance));
  const stream = createReadStream(path, {
    highWaterMark: 60 * 1024,
  });
  stream.pipe(demuxInitializerInstance).on("error", (err) => {
    console.error(c.red(`error piping to the transform ${err.message}`));
  });
  await awaitDemux;
  const stat = await fs.stat(`${config.getDestinationPath()}/${fileName}`);
  const formattedSize = formatBytes(stat.size);
  const finalSize = formatBytes(size)
  expect(formattedSize).toEqual(finalSize);
});