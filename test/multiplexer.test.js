import * as memfs from "memfs";
jest.mock("fs/promises", () => memfs.promises);
jest.mock("fs", () => memfs);
import multiplexer, { createPacket } from "../multiplexer.js";
import { PassThrough } from "stream";
import { join } from "path";
import c from "ansi-colors";
const json = {
  "./fileOne.txt":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "./fileTwo.txt":
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "./fileThree.txt":
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "./dirOne/fileFour.txt":
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "./dirOne/fileFive.txt":
    "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.",
  "./dirOne/dirTwo/fileSix.txt":
    "Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc.",
  "./dirOne/dirTwo/fileSeven.txt":
    "Maecenas ullamcorper odio et justo convallis in condimentum justo facilisis.",
  "./dirOne/dirTwo/dirThree/fileEight.txt":
    "Nulla facilisi. Integer lacinia sollicitudin massa. Cras metus.",
  "./dirOne/dirTwo/dirThree/fileNine.txt":
    "Sed a libero. Vestibulum eu odio. Morbi vestibulum volutpat enim.",
  "./dirTwo/fileTen.txt":
    "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  "./dirTwo/fileEleven.txt":
    "Mauris ut leo. Cras viverra metus rhoncus sem. Nulla et lectus vestibulum urna fringilla ultrices.",
  "./dirTwo/dirFour/fileTwelve.txt":
    "Phasellus eu tellus sit amet tortor gravida placerat. Integer sapien est, iaculis in, pretium quis, viverra ac, nunc.",
  "./dirTwo/dirFour/fileThirteen.txt":
    "Praesent eget sem vel leo ultrices bibendum. Aenean faucibus.",
  "./dirTwo/dirFour/dirFive/fileFourteen.txt":
    "Nullam at arcu a est sollicitudin euismod.",
  "./dirTwo/dirFour/dirFive/fileFifteen.txt":
    "Vestibulum rutrum, mi nec iaculis ultricies, ligula nulla suscipit odio, at ultricies est mauris ac diam.",
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
