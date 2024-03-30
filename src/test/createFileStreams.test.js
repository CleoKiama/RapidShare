import * as memfs from "memfs";

jest.mock("fs", () => memfs);
jest.mock("fs/promises", () => memfs.promises);

import createStreamSources from "../backend/createFileStreams.js";
import lazystream from "lazystream";
import GenerateFiles from "../backend/generateFiles.js";
const json = {
  "./README.md": "read me",
  "./src/index.js": "2",
  "./node_modules/debug/index.js": "3",
};

beforeEach(() => {
  memfs.vol.reset();
  memfs.vol.fromJSON(json, "/app");
});

test("createStreamSources should return an array of readable streams", async () => {
  const pathToFiles = "/app";
  const files = [];
  let dirsLength = Object.keys(json).length;
  for await (const foundFiles of new GenerateFiles(pathToFiles, 4)) {
    if (Object.hasOwn(foundFiles, 'empty')) continue
    files.push(...foundFiles);
  }
  expect(files).toHaveLength(dirsLength);
  const sources = createStreamSources(files);
  expect(sources[0]).toBeInstanceOf(lazystream.Readable);
  const onDataPromise = new Promise((resolve) => {
    let data = "";
    sources[0].on("data", (chunk) => {
      data += chunk.toString();
    });
    sources[0].on("end", () => {
      resolve(data);
    });
  });
  const streamClosedPromise = new Promise((resolve) => {
    sources[0].on("close", () => {
      resolve();
    });
  });
  const data = await onDataPromise;
  expect(data).toBe("read me");
  setTimeout(() => {
    sources[0].destroy();
  }, 500);
  await streamClosedPromise;
});
