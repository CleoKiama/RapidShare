import * as memfs from "memfs";
jest.mock("fs/promises", () => memfs.promises);
jest.mock("fs", () => memfs);
jest.mock("../rootSourcePath.js",()=>{
  return jest.fn(()=>{
    return "/root"
  })
})
import multiplexer, { createPacket } from "../multiplexer.js";
import { PassThrough } from "stream";
import { join } from "path";

const json = {
  "./fileOne.txt":
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
  "./fileTwo.txt": "A journey of a thousand miles begins with a single step.",
  "./fileThree.txt": "Actions speak louder than words.",
  "./dirOne/fileFour.txt":
    "Life is what happens when you're busy making other plans.",
  "./dirOne/fileFive.txt": "Every cloud has a silver lining.",
  "./dirOne/dirTwo/fileSix.txt": "Where there's a will, there's a way.",
  "./dirOne/dirTwo/fileSeven.txt":
    "The only limit to our realization of tomorrow will be our doubts of today.",
  "./dirOne/dirTwo/dirThree/fileEight.txt":
    "It always seems impossible until it's done.",
  "./dirOne/dirTwo/dirThree/fileNine.txt":
    "Don't count the days, make the days count.",
  "./dirTwo/fileTen.txt":
    "The only impossible journey is the one you never begin.",
  "./dirTwo/fileEleven.txt": "Believe you can and you're halfway there.",
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
  const path = "home/user/root/files/file.txt";
  const expectedBasePath = "/root/files/file.txt";
  const packet = createPacket(path, chunk);
  const packetSize = packet.readUInt32BE(0);
  expect(packetSize).toBe(1 + expectedBasePath.length + chunk.length);
  const returnedPathLength = packet.readUInt8(4);
  expect(returnedPathLength).toBe(expectedBasePath.length);
  const returnedPath = packet.toString("utf8", 5, 5 + expectedBasePath.length);
  const returnedChunk = packet.toString(
    "utf8",
    5 + expectedBasePath.length,
    packet.length
  );
  expect(returnedPath).toBe(expectedBasePath);
  expect(returnedChunk).toBe(chunkContent);
});

test("sends a packet with just the path and no content chunk", () => {
  const path = "home/user/root/files/file.txt";
  const expectedBasePath = "/root/files/file.txt";
  const packet = createPacket(path, null);
  const packetSize = packet.readUInt32BE(0);
  expect(packetSize).toBe(1 + expectedBasePath.length);
  const returnedPathLength = packet.readUInt8(4);
  expect(returnedPathLength).toBe(expectedBasePath.length);
  const returnedPath = packet.toString("utf8", 5, 5 + expectedBasePath.length);
  expect(returnedPath).toBe(expectedBasePath);
});
test("multiplexes multiple streams", async () => {
  memfs.vol.fromJSON(json, "/app/root");
  const pathToFiles = "/app/root";
  const paths = Object.keys(json);
  const expectedData = Object.values(json);
  const expectedPaths = paths.map((path) => join("/root", `${path}`));
  const destination = new PassThrough();
  var currentLength = null;
  var currentPath = null;
  var returnedPaths = []
  var returnedData = []
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
    const returnedChunk = chunk.toString(
      "utf8",
      1 + pathLength,
      chunk.length
    );
     if(returnedChunk!=="all done") {
      returnedData.push(returnedChunk)
      returnedPaths.push(currentPath)
     }
    currentLength = null;
    currentPath = null;
  });
  try {
    await multiplexer(pathToFiles, destination);
  } catch (error) {
    console.error(error);
  }
  await new Promise((resolve) => {
    destination.on("end", () => {
      resolve();
    });
  });
    expect(returnedData).toEqual(expect.arrayContaining(expectedData))
    expect(returnedPaths).toEqual(expect.arrayContaining(expectedPaths))
    expect(returnedData).toHaveLength(expectedData.length)
    expect(returnedPaths).toHaveLength(expectedPaths.length)
});

test("it handles empty directories", async () => {
  memfs.vol.mkdirSync("/app");
  memfs.vol.mkdirSync("/app/root");
  memfs.vol.mkdirSync("/app/root/emptyDirOne");
  memfs.vol.mkdirSync("/app/root/emptyDirTwo");
  memfs.vol.mkdirSync("/app/root/emptyDirThree");
  const emptyDirs = Object.keys(memfs.vol.toJSON()).map((value)=>{
         return value.substring(4)
  })
  const returnedEmptyDirs = [];
  const path = "/app/root";
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
  returnedEmptyDirs.shift();
  expect(returnedEmptyDirs).toEqual(expect.arrayContaining(emptyDirs));
  expect(returnedEmptyDirs).toHaveLength(emptyDirs.length);
});
