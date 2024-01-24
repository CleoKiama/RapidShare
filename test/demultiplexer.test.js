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
  "./dirOne/dirTwo/fileEmpty.txt": " "
};

beforeEach(() => {
  memfs.vol.reset();
  memfs.vol.fromJSON(json, "/app");
});

test("demultiplexes the received packets", async () => {
  const pathToFiles = "/app";
  const prevFs = {};
  let keys = Object.keys(json).map((key) => {
    return path.join("/app", key);
  });
  Object.values(json).forEach((value, index) => {
    prevFs[keys[index]] = value;
  });
  const source = new PassThrough();
  await multiplexer(pathToFiles, source);
  await Demultiplexer(source);
  let currentFs = memfs.vol.toJSON();
  expect(currentFs).toEqual(prevFs);
});
