import * as memfs from "memfs";
jest.mock("fs/promises", () => memfs.promises);
import readFilesSize from "../readFilesSize.js";

const json = {
  "./dirOne/Readme.txt": Buffer.alloc(100),
  "./dirOne/fileOne.md": Buffer.alloc(100),
  "./fileTwo.md": Buffer.alloc(200),
  "./fileThree.txt": Buffer.alloc(500),
  "./dirOne/dirTwo/fileFour.txt": Buffer.alloc(300),
  "./dirOne/dirTwo/fileFive.md": Buffer.alloc(400),
  "./dirOne/dirThree/fileSix.txt": Buffer.alloc(600),
  "./dirOne/dirThree/fileSeven.md": Buffer.alloc(700),
  "./dirFour/fileEight.txt": Buffer.alloc(800),
  "./dirFour/fileNine.md": Buffer.alloc(900),
  "./dirFour/dirFive/fileTen.txt": Buffer.alloc(1000),
  "./dirFour/dirFive/fileEleven.md": Buffer.alloc(1100),
};

beforeEach(() => {
  memfs.vol.reset();
  memfs.vol.fromJSON(json, "/app");
});

afterEach(() => {
  memfs.vol.reset();
});
test("reads total size of a directory", async () => {
  const pathToFiles = "/app";
  let totalSize = await readFilesSize(pathToFiles);

  expect(totalSize).toBe(0.0064);
});
