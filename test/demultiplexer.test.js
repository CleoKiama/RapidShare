import * as memfs from "memfs";
jest.mock("fs/promises", () => memfs.promises);
jest.mock("fs", () => memfs);
import multiplexer from "../multiplexer.js";
import Demultiplexer from "../demultiplexer.js";
import { PassThrough } from "stream";
import path from "path";
const json = {
  "./dirOne/fileOne.txt": "file one text content",
  "./fileFive.txt": "content of file five.txt",
  "./fileSix.txt": "content of file six.txt here",
  "./dirOne/dirTwo/fileFour.txt": "content of file four.txt",
  "./dirOne/dirTwo/fileTwo.txt": "content of file two.txt",
  "./dirOne/dirTwo/fileThree.txt": "content of file three.txt",
  "./dirOne/dirTwo/fileEmpty.txt": "hello yeah",
  "./dirOne/dirTwo/dirThree/fileSeven.txt": "content of file seven.txt",
  "./dirOne/dirTwo/dirThree/fileEight.txt": "content of file eight.txt",
  "./dirOne/dirTwo/dirThree/fileNine.txt": "content of file nine.txt",
  "./dirOne/dirTwo/dirThree/fileTen.txt": "content of file ten.txt",
  "./dirOne/dirTwo/dirThree/fileEleven.txt": "content of file eleven.txt",
};

beforeEach(() => {
  memfs.vol.reset();
});

test("demultiplexes nested files and folders", async () => {
  memfs.vol.fromJSON(json, "/app");
  const pathToFiles = "/app";
  const prevFs = {};
  let keys = Object.keys(json).map((key) => {
    return path.join("/app", key);
  });
  Object.values(json).forEach((value, index) => {
    prevFs[keys[index]] = value;
  });
  const source = new PassThrough();
  let pendingDemux = Promise.resolve(Demultiplexer(source));
  multiplexer(pathToFiles,source);
  await pendingDemux;
  let currentFs = memfs.vol.toJSON();
  expect(Object.keys(currentFs)).toHaveLength(keys.length)
  expect(currentFs).toEqual(prevFs);
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
