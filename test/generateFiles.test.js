import * as memfs from "memfs";
import GenerateFiles from "../generateFiles.js";
jest.mock("fs/promises", () => memfs.promises);
const json = {
  "./dirOne/Readme.txt": "hello there",
  "./dirOne/fileOne.md": "this is fileOne.md",
  "./fileTwo.md": "this is file two content.md .yeah",
  "./fileThree.txt": "yeah today I decided to use the lib.yeah",
  "./dirOne/dirTwo/fileFour.txt": "hashtag deep work",
  "./dirOne/dirTwo/fileFive.md": "Yeah I love my life",
};

beforeEach(() => {
  memfs.vol.reset();
  memfs.vol.fromJSON(json, "/app");
});
test("it generates four file paths at time", async () => {
  const path = "/app";
  let foundFiles = [];
  const originalFiles = Object.keys(json).map(path=>`/app${path.substring(1)}`)
  for await (const files of new GenerateFiles(path)) {
    foundFiles.push(...files);
  }
  expect(foundFiles).toEqual(expect.arrayContaining(originalFiles));
});
