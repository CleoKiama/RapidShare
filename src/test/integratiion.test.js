import * as memfs from "memfs";
jest.mock("fs/promises", () => memfs.promises);
jest.mock("fs", () => memfs);
import main from "../server.js";
import path from "path";
import { socket } from "../client.js";

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
async function awaitClient() {
  return new Promise((done) => {
    socket.on("close", done);
  });
}
test("the client receives all the files sent", async () => {
  memfs.vol.fromJSON(json, "/app");
  const pathToFiles = "/app";
  const prevFs = {};
  let keys = Object.keys(json).map((key) => {
    return path.join("/app", key);
  });
  Object.values(json).forEach((value, index) => {
    prevFs[keys[index]] = value;
  });
  let awaitMain = Promise.resolve(main(pathToFiles));
  await Promise.all([awaitClient(), awaitMain]);
  let currentFs = memfs.vol.toJSON();
  expect(currentFs).toEqual(prevFs);
});
