import path from "node:path"
import GenerateFiles from "../backend/generateFiles.js";
import fs from "fs-extra"

const rootDir = "/tmp/fileGenerator_test";

const filesData = {
  "./dirOne/Readme.txt": "hello there",
  "./dirOne/fileOne.md": "this is fileOne.md",
  "./fileTwo.md": "this is file two content.md .yeah",
  "./fileThree.txt": "yeah today I decided to use the lib.yeah",
  "./dirOne/dirTwo/fileFour.txt": "hashtag deep work",
  "./dirOne/dirTwo/fileFive.md": "Yeah I love my life",
  "./dirOne/dirTwo/dirThree/fileSix.txt": "Testing nested fileSix",
  "./dirOne/dirTwo/dirThree/fileSeven.md": "Another nested fileSeven",
  "./dirOne/dirTwo/dirThree/dirFour/fileEight.txt": "Even deeper fileEight",
  "./dirOne/dirTwo/dirThree/dirFour/fileNine.md": "Deeper fileNine",
  "./dirOne/fileTen.txt": "Tenth file content",
  "./dirOne/fileEleven.md": "Eleventh file content",
  "./fileTwelve.txt": "Twelfth file content",
  "./dirOne/dirTwo/fileThirteen.txt": "Thirteenth file content",
  "./dirOne/dirTwo/fileFourteen.md": "Fourteenth file content",
  "./dirOne/dirTwo/dirThree/fileFifteen.txt": "Fifteenth file content",
  "./dirOne/dirTwo/dirThree/fileSixteen.md": "Sixteenth file content",
  "./dirOne/dirTwo/dirThree/dirFour/fileSeventeen.txt": "Seventeenth file content",
  "./dirOne/dirTwo/dirThree/dirFour/fileEighteen.md": "Eighteenth file content",
  "./dirOne/dirTwo/dirThree/dirFour/fileNineteen.txt": "Nineteenth file content",
  "./dirOne/dirTwo/dirThree/dirFour/fileTwenty.md": "Twentieth file content",
  "./emptyDirOne/": "",
  "./dirOne/emptyDirTwo/": "",
  "./dirOne/dirTwo/emptyDirThree/": ""
};

beforeEach(async () => {
  for (const [key, value] of Object.entries(filesData)) {
    if (value === "") {
      await fs.ensureDir(`${rootDir}/${key}`);
    } else {
      await fs.outputFile(`${rootDir}/${key}`, value);
    }
  }
})



test("it walks through the file system and generates files", async () => {
  const currentPath = "/tmp/fileGenerator_test";
  const concurrency = 2
  const expectedFiles = Object.keys(filesData)
    .filter(value => filesData[value] !== "")
    .map(value => path.resolve(rootDir, value));

  const expectedEmptyDirs = [
    `${rootDir}/emptyDirOne`,
    `${rootDir}/dirOne/emptyDirTwo`,
    `${rootDir}/dirOne/dirTwo/emptyDirThree`
  ];
  const walkDir = new GenerateFiles(currentPath, concurrency);
  const files = [];
  const emptyDirs = [];
  const iterator = walkDir[Symbol.asyncIterator]();
  let iteratorResult = await iterator.next()
  expect(iteratorResult.value.length).toBe(concurrency);
  while (!iteratorResult.done) {
    if (Object.hasOwn(iteratorResult.value, 'empty')) {
      emptyDirs.push(iteratorResult.value.path);
    } else {
      files.push(...iteratorResult.value);
    }
    iteratorResult = await iterator.next()
  }

  expect(files.length).toBe(21);
  expect(emptyDirs.length).toBe(3);
  expect(files).toEqual(expect.arrayContaining(expectedFiles));
  expect(emptyDirs).toEqual(expect.arrayContaining(expectedEmptyDirs));
})


