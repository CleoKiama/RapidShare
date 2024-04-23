import { createPacket } from "../backend/multiplexer.js";

test("creates a packet with the path of the file in it", () => {
  const chunkContent = "hello this is chunk content"
  const chunk = Buffer.from(chunkContent);
  const progress = 50
  const path = "/file.txt";
  let pathBuf = Buffer.from(path)
  const packet = createPacket(path, chunk, progress);
  const packetSize = packet.readUInt32BE(0);
  expect(packetSize).toBe(1 + 1 + pathBuf.length + chunk.length);
  const returnedProgress = packet.readUint8(4)
  expect(returnedProgress).toBe(progress)
  const returnedPathLength = packet.readUInt8(5);
  expect(returnedPathLength).toBe(pathBuf.length);
  const returnedPath = packet.toString("utf8", 6, 6 + path.length);
  const returnedChunk = packet.toString(
    "utf8",
    6 + path.length,
    packet.length
  );
  expect(returnedPath).toBe(path);
  expect(returnedChunk).toBe(chunkContent)
});

test("sends a packet with just the path and no content chunk", () => {
  const expectedBasePath = "/file.txt";
  const progress = 40
  //***createPacket should expect a relative path
  const packet = createPacket('/file.txt', null, progress);
  expect(packet).toHaveLength(4 + 1 + 1 + expectedBasePath.length)
  const packetSize = packet.readUInt32BE(0);
  expect(packetSize).toBe(1 + 1 + expectedBasePath.length);
  const returnedProgress = packet.readUint8(4)
  expect(returnedProgress).toBe(progress)
  const returnedPathLength = packet.readUInt8(5);
  expect(returnedPathLength).toBe(expectedBasePath.length);
  const returnedPath = packet.toString("utf8", 6, 6 + expectedBasePath.length);
  expect(returnedPath).toBe(expectedBasePath);
});

test("sends progress percentage in packet", () => {
  let path = "/testfile.txt"
  let chunk = Buffer.from("Hello this is a test chunk")
  let progress = 70
  let pathBuf = Buffer.from(path)
  const expectedPacketSize = 4 + 1 + 1 + pathBuf.length + chunk.length
  let packet = createPacket(path, chunk, progress)
  expect(packet).toHaveLength(expectedPacketSize)
  let returnedProgress = packet.readUint8(4)
  expect(returnedProgress).toBe(progress)
})



