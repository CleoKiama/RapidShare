import * as memfs from "memfs";
import c from 'ansi-colors'
import GenerateFiles from "../generateFiles.js";

jest.mock("fs-extra", () => memfs.promises);

const json = {
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
  "./dirOne/dirTwo/dirThree/dirFour/fileTwenty.md": "Twentieth file content"
};

beforeEach(() => {
  memfs.vol.reset();
});


test("it generates four file paths at time", async () => {
  memfs.vol.fromJSON(json, "/app");
  const path = "/app";
  let foundFiles = [];
  const originalFiles = Object.keys(json).map(
    (path) => `/app${path.substring(1)}`
  );
  const generate = new GenerateFiles(path);
  for await (const files of generate) {
    if(files.length===0) {
      console.log(c.red(`in this instance the files array is empty`))
    }
    foundFiles.push(...files);
    expect(files.length).toBeLessThan(5)
  }
  expect(foundFiles).toEqual(expect.arrayContaining(originalFiles))
  expect(foundFiles).toHaveLength(originalFiles.length);
});



test("handles empty directories and returns the path", async () => {
  // ** caveat the root directory is considered empty if it has no files 
  memfs.vol.mkdirSync("/app");
  memfs.vol.mkdirSync("/app/emptyDirOne");
  memfs.vol.mkdirSync("/app/emptyDirTwo");
  memfs.vol.mkdirSync("/app/emptyDirThree");
  const path = "/app";  
  let emptyDirs = Object.keys(memfs.vol.toJSON())
   const foundEmptyDirs = []
  const generate = new GenerateFiles(path);
  for await (const dirent of generate) {
    foundEmptyDirs.push(dirent.path)
    expect(dirent.empty).toBe(true)
  }
   foundEmptyDirs.shift()
   expect(emptyDirs).toEqual(expect.arrayContaining(foundEmptyDirs))
   expect(foundEmptyDirs).toHaveLength(emptyDirs.length)

}); 
test('handles one empty Directory',async ()=>{
  memfs.vol.mkdirSync("/app");
   const path = '/app' ; 
   let emptyDirs = Object.keys(memfs.vol.toJSON())
   const foundEmptyDir = []
   const generate = new GenerateFiles(path);
   let hasPropertyEmpty = false
  for await (const dirent of generate) {
    if(Object.hasOwn(dirent, 'empty')) {
      hasPropertyEmpty  = true
    } 
    foundEmptyDir.push(dirent.path)
    expect(dirent.empty).toBe(true)
  }
  expect(hasPropertyEmpty).toBe(true)
  expect(foundEmptyDir).toHaveLength(1)
  expect(foundEmptyDir).toEqual(expect.arrayContaining(emptyDirs))
})
