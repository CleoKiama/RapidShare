import * as memfs from "memfs";
jest.mock("fs/promises", () => memfs.promises);
import identifyPath from "../pathType.js";

const json = {
  "./dirOne/fileOne.txt": "content of file One",
};
beforeEach(() => {
  memfs.vol.reset();
  memfs.vol.fromJSON(json, "/app");
});

test("it identifies a directory", async () => {
  const pathToFile = "/app/dirOne";
  let util = await identifyPath(pathToFile);
  expect(util).toEqual({
    isDir: true,
    isFile: false,
  });
});

test("it identifies a file", async () => {
    const pathToFile = "/app/dirOne/fileOne.txt";
    let util = await identifyPath(pathToFile);
    expect(util).toEqual({
      isDir: false,
      isFile: true,
    });
 });