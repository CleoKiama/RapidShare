import * as memfs from "memfs";
jest.mock("fs/promises", () => memfs.promises);
jest.mock("fs", () => memfs);
import multiplexer, { createPacket } from "../multiplexer.js";
import { PassThrough } from "stream";
import { join } from "path";
import c from "ansi-colors";
const json = {
  "./fileOne.txt":
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
  "./fileTwo.txt":
    "A journey of a thousand miles begins with a single step.",
  "./fileThree.txt":
    "Actions speak louder than words.",
  "./dirOne/fileFour.txt":
    "Life is what happens when you're busy making other plans.",
  "./dirOne/fileFive.txt":
    "Every cloud has a silver lining.",
  "./dirOne/dirTwo/fileSix.txt":
    "Where there's a will, there's a way.",
  "./dirOne/dirTwo/fileSeven.txt":
    "The only limit to our realization of tomorrow will be our doubts of today.",
  "./dirOne/dirTwo/dirThree/fileEight.txt":
    "It always seems impossible until it's done.",
  "./dirOne/dirTwo/dirThree/fileNine.txt":
    "Don't count the days, make the days count.",
  "./dirTwo/fileTen.txt":
    "The only impossible journey is the one you never begin.",
  "./dirTwo/fileEleven.txt":
    "Believe you can and you're halfway there.",
  "./dirTwo/dirFour/fileTwelve.txt":
    "Life is either a daring adventure or nothing at all.",
  "./dirTwo/dirFour/fileThirteen.txt":
    "You have within you right now, everything you need to deal with whatever the world can throw at you.",
  "./dirTwo/dirFour/dirFive/fileFourteen.txt":
    "The best way to predict the future is to create it.",
  "./dirTwo/dirFour/dirFive/fileFifteen.txt":
    "The only limit to our realization of tomorrow will be our doubts of today.",
};


beforeEach(() => {
  memfs.vol.reset();
});

test("creates a packet with the path of the file in it", () => {
  const chunkContent = "hello this is chunk content";
  const chunk = Buffer.from(chunkContent);
  const path = "/path/app/files/file.txt";
  const pathBuffer = Buffer.from(path);
  const packet = createPacket(path, chunk);
  const packetSize = packet.readUInt32BE(0);
  expect(packetSize).toBe(1 + pathBuffer.length + chunk.length);
  const pathLength = packet.readUInt8(4);
  expect(pathLength).toBe(pathBuffer.length);
  const returnedPath = packet.toString("utf8", 5, 5 + pathBuffer.length);
  const returnedChunk = packet.toString(
    "utf8",
    5 + pathBuffer.length,
    packet.length
  );
  expect(returnedPath).toBe(path);
  expect(returnedChunk).toBe(chunkContent);
});

test("sends a packet with just the path and no content chunk", () => {
  const path = "/path/app/files/file.txt";
  const pathBuffer = Buffer.from(path);
  const packet = createPacket(path, null);
  const packetSize = packet.readUInt32BE(0);
  expect(packetSize).toBe(1 + pathBuffer.length);
  const pathLength = packet.readUInt8(4);
  expect(pathLength).toBe(pathBuffer.length);
  const returnedPath = packet.toString("utf8", 5, 5 + pathBuffer.length);
  expect(returnedPath).toBe(path);
});
test("multiplexes multiple streams", async () => {
  memfs.vol.fromJSON(json, "/app");
  const pathToFiles = "/app";
  const paths = Object.keys(json);
  const content = Object.values(json);
  const expectedPaths = paths.map((path) => join("/app", `${path}`));
  const destination = new PassThrough();
  let currentLength = null;
  let currentPath = null;
  let pathsReturned = 0;
  let chunksReturned = 0;
  destination.on("readable", function () {
    let chunk;
    if (currentLength === null) {
      chunk = destination.read(4);
      currentLength = chunk && chunk.readUInt32BE(0);
    }
    if (currentLength === null) {
      return null;
    }
    chunk = destination.read(currentLength);
    if (chunk === null) {
      return null;
    }
    let pathLength = chunk.readUInt8(0);
    currentPath = chunk.toString("utf8", 1, 1 + pathLength);
    expect(expectedPaths).toContain(currentPath);
    pathsReturned++;
    const returnedContent = chunk.toString(
      "utf8",
      1 + pathLength,
      chunk.length
    );
    expect(content).toContain(returnedContent);
    chunksReturned++;
    currentLength = null;
    currentPath = null;
  });
  try {
    // ** potential zalgo
    await multiplexer(pathToFiles, destination);
  } catch (error) {
    console.error(error);
  }
  await new Promise((resolve) => {
    console.log(c.blue(`registering the end event`));
    destination.on("end", () => {
      console.log(c.magentaBright(`end event exiting the test now`));
      resolve();
    });
  });

  expect(pathsReturned).toBe(paths.length);
  expect(chunksReturned).toBe(paths.length);
});

test("it handlese empty directories", async () => {
  memfs.vol.mkdirSync("/app");
  memfs.vol.mkdirSync("/app/emptyDirOne");
  memfs.vol.mkdirSync("/app/emptyDirTwo");
  memfs.vol.mkdirSync("/app/emptyDirThree");
  const emptyDirs = Object.keys(memfs.vol.toJSON());
 
  const returnedEmptyDirs = [];
  const path = "/app";
  const destination = new PassThrough();
  let currentLength = null;
  let currentPath = null;
  destination
    .on("readable", function () {
      let chunk;
      if (currentLength === null) {
        chunk = destination.read(4);
        currentLength = chunk && chunk.readUInt32BE(0);
      }
      if (currentLength === null) {
        return null;
      }

      chunk = destination.read(currentLength);
      if (chunk.length === null) {
        return null;
      }
      let pathLength = chunk.readUInt8(0);
      currentPath = chunk.toString("utf8", 1, 1 + pathLength);
      const bufferContent = chunk.toString(
        "utf8",
        1 + pathLength,
        chunk.length
      );
      expect(bufferContent).toHaveLength(0);
      returnedEmptyDirs.push(currentPath);
      currentPath = null;
      currentLength = null;
    })
    .on("error", (error) => {
      console.error(`error in the destination stream ${error.message}`);
    });
  try {
    multiplexer(path, destination).catch((error) => {
      throw new Error(error.message);
    });
  } catch (error) {
    console.error(error);
  }

  await new Promise((resolve) => {
    destination.on("end", () => {
      console.log("destination stream closed finishing the test now");
      resolve();
    });
  });  
  console.log(emptyDirs)
  returnedEmptyDirs.shift()
  console.log(returnedEmptyDirs)
  expect(emptyDirs).toEqual(expect.arrayContaining(returnedEmptyDirs))
});
