import * as memfs from "memfs";
jest.mock("fs/promises", () => memfs.promises);
jest.mock("fs", () => memfs);
import multiplexer from "../multiplexer.js";
import Demultiplexer from "../demultiplexer.js";
import { PassThrough } from "stream";
import c from "ansi-colors";
import path from "path";
const json = {
  "./dirOne/fileOne.txt": "file one text content",
  "./fileFive.txt": "content of file five.txt",
  "./fileSix.txt": "content of file six.txt here",
  "./dirOne/dirTwo/fileFour.txt": "content of file four.txt",
  "./dirOne/dirTwo/fileTwo.txt": "content of file two.txt",
  "./dirOne/dirTwo/fileThree.txt": "content of file three.txt",
  "./dirOne/dirTwo/fileEmpty.txt": "",
  "./dirOne/dirTwo/dirThree/fileSeven.txt": "content of file seven.txt",
  "./dirOne/dirTwo/dirThree/fileEight.txt": "content of file eight.txt",
  "./dirOne/dirTwo/dirThree/fileNine.txt": "content of file nine.txt",
  "./dirOne/dirTwo/dirThree/fileTen.txt": "content of file ten.txt",
  "./dirOne/dirTwo/dirThree/fileEleven.txt": "content of file eleven.txt",
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
  memfs.vol.reset();
  memfs.vol.fromJSON(json, "/app");
  await Demultiplexer(source).catch(error=>{
    console.error(error.message)
  })
  let currentFs = memfs.vol.toJSON();
  console.log(currentFs);
  expect(currentFs).toEqual(prevFs);
});
