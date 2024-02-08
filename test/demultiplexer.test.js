import * as memfs from "memfs";
jest.mock("fs/promises", () => memfs.promises);
jest.mock("fs", () => memfs);
import multiplexer from "../multiplexer.js";
import Demultiplexer from "../demultiplexer.js";
import { PassThrough } from "stream";
import path from "path";
const json = {
  "./oldVolume/dirOne/fileOne.txt": "file one text content",
  "./oldVolume/fileFive.txt": "content of file five.txt",
  "./oldVolume/fileSix.txt": "content of file six.txt here",
  "./oldVolume/dirOne/dirTwo/fileFour.txt": "content of file four.txt",
  "./oldVolume/dirOne/dirTwo/fileTwo.txt": "content of file two.txt",
  "./oldVolume/dirOne/dirTwo/fileThree.txt": "content of file three.txt",
  "./oldVolume/dirOne/dirTwo/fileEmpty.txt": "hello yeah",
  "./oldVolume/dirOne/dirTwo/dirThree/fileSeven.txt":
    "content of file seven.txt",
  "./oldVolume/dirOne/dirTwo/dirThree/fileEight.txt":
    "content of file eight.txt",
  "./oldVolume/dirOne/dirTwo/dirThree/fileNine.txt": "content of file nine.txt",
  "./oldVolume/dirOne/dirTwo/dirThree/fileTen.txt": "content of file ten.txt",
  "./oldVolume/dirOne/dirTwo/dirThree/fileEleven.txt":
    "content of file eleven.txt",
};

beforeEach(() => {
  process.argv[2] = "/newVolume";

  memfs.vol.reset();
});
 
test("demultiplexes nested files and folders", async () => {
  memfs.vol.fromJSON(json, "/app");
  const pathToFiles = "/app";
  const prevFs = {};
  let initialFilePaths = Object.keys(json).map((key) => {
    return path.join("/app", key);
  });
  Object.values(json).forEach((value, index) => {
    prevFs[initialFilePaths[index]] = value;
  });

  const source = new PassThrough();
  let pendingDemux = Promise.resolve(Demultiplexer(source));
  await multiplexer(pathToFiles, source);
  try {
    await pendingDemux;
  } catch (err) {
    console.log(err);
  }
  let currentFs = memfs.vol.toJSON();
  const regex = /newVolume/;
   let currentFsKeys  = Object.keys(currentFs).filter((value) => {
    if (regex.test(value)) return true;
    else return false;
  });

  expect(currentFsKeys).toHaveLength(initialFilePaths.length);
  
});

test("the file demultiplexes empty directories", async () => {
  memfs.vol.mkdirSync("/app");
  memfs.vol.mkdirSync("/app/emptyDirOne");
  memfs.vol.mkdirSync("/app/emptyDirTwo");
  memfs.vol.mkdirSync("/app/emptyDirThree");
  let prevFs = memfs.vol.toJSON();
  const path = "/app";
  const source = new PassThrough();
  let pendingDemux = Promise.resolve(Demultiplexer(source));
  multiplexer(path, source);
  await pendingDemux;
  let currentFs = memfs.vol.toJSON();
   
  expect(currentFs).toEqual(prevFs);
});

test("the file demultiplexes one empty directories", async () => {
  memfs.vol.mkdirSync("/app");
  let prevFs = memfs.vol.toJSON();
  const path = "/app";
  const source = new PassThrough();
  let pendingDemux = Promise.resolve(Demultiplexer(source));
  multiplexer(path, source);
  await pendingDemux;
  let currentFs = memfs.vol.toJSON();
  expect(currentFs).toEqual(prevFs);
});
