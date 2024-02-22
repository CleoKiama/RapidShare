//import lazystream from "lazystream";
import formatBytes from "./formatBytes.js";
import validatePath from "./validatePath";
import fs, { createWriteStream } from "fs-extra";
import c from "ansi-colors";
import { promisify } from "util";
import rootDestinationPath from "./rootDestinationPath.js";

const destinationPath = validatePath(rootDestinationPath());
console.log(destinationPath)
export default class DestinationResolver {
  constructor() {
    this.pendingFiles = new Map();
  }

  async writeToDestination(destinationPath, dataBuffer) {
    let fileStream;
    let writeAsync;

    if (this.pendingFiles.has(destinationPath)) {
      fileStream = this.pendingFiles.get(destinationPath);
      writeAsync = promisify(fileStream.write).bind(fileStream);
      return await writeAsync(dataBuffer);
    }

    console.log("Ensuring the file exists")
    this.createFileIfNotExists(destinationPath);
    console.log(`Writing data: ${formatBytes(dataBuffer.length)}`)
    fileStream = createWriteStream(destinationPath);
    writeAsync = promisify(fileStream.write).bind(fileStream);
    this.pendingFiles.set(destinationPath, fileStream);
    await writeAsync(dataBuffer);
  }

  createFileIfNotExists(filePath) {
    return fs.ensureFileSync(filePath);
  }

  createDirectoryIfNotExists(directoryPath) {
    console.log(c.red("Creating directory (if it doesn't exist)"));
    return fs.ensureDir(directoryPath);
  }

  async saveToFileSystem(relativePath, dataBuffer) {
    const fullPath = `${destinationPath}${relativePath.toString()}`;
    if (dataBuffer === null) return this.createDirectoryIfNotExists(fullPath);
    if (dataBuffer.toString() === "all done") {
      return this.pendingFiles.get(fullPath).end();
    }
    await this.writeToDestination(fullPath, dataBuffer);
  }
}



