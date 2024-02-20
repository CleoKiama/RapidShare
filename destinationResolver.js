//import lazystream from "lazystream";
import formatBytes from "./formatBytes.js";
import validatePath from "./validatePath";
import fs, { createWriteStream } from "fs-extra";
import c from "ansi-colors";
import { promisify } from "util";
//TODO change this to be one source of knowledge when later you add electron.js
process.env.NODE_ENV === "test" && (process.argv[2] = "/media/cleo/Library");

const destinationPath = validatePath(process.argv[2]);

export default class resolveDestination {
  constructor() {
    this.incomingFiles = new Map();
    this.chunkBuffer = new Map()
  }
  async returnDestination(finalPath, contentBuffer) {
    let destination;
    let writeAsync;
    if (this.incomingFiles.has(finalPath)) {
      destination = this.incomingFiles.get(finalPath);
      writeAsync = promisify(destination.write).bind(destination);
      return await writeAsync(contentBuffer); //TODO this path might need to be normalized
    }
    console.log("ensuring the file once hopefully")
    // ** there is a block of the event loop here but once per new file so should not cause too much harm I hope
     this.ensurePath(finalPath);
    console.log(`after resolve content Buffer ${formatBytes(contentBuffer.length)}`)
    destination = createWriteStream(finalPath);
    writeAsync = promisify(destination.write).bind(destination);
    this.incomingFiles.set(finalPath, destination);
    await writeAsync(contentBuffer);
  }
  ensurePath(path) {
    return fs.ensureFileSync(path);
  }
  ensureDirPath(path) {
    console.log(c.red("running ensureDir path probably a problem"));
    return fs.ensureDir(path);
  }
  async saveData(currentPath, contentBuffer) {
    const finalPath = `${destinationPath}${currentPath.toString()}`;
    if (contentBuffer === null) return this.ensureDirPath(finalPath);
    if (contentBuffer.toString() === "all done") {
      console.log(c.green("all done"));
      return this.incomingFiles.get(finalPath).end();
    }
    await this.returnDestination(finalPath, contentBuffer);
  }
}

