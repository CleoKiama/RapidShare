import { readdir } from "fs/promises";
import c from "ansi-colors";
export default class GenerateFiles {
  constructor(basePath) {
    this.path = basePath;
    this.remainingDirs = [];
  }
  async readDir(path) {
    const foundFiles = [];

    const found = await readdir(path, { withFileTypes: true });
    for (const dirent of found) {
      if (dirent.isFile()) {
        foundFiles.push(`${path}/${dirent.name}`);
      } else if (dirent.isDirectory()) {
        this.remainingDirs.push(`${path}/${dirent.name}`);
      } else {
        //TODO  it is just an empty directory edge case
        console.log(c.blue("neither a file nor a directory"));
      }
    }

    return foundFiles;
  }
  [Symbol.asyncIterator]() {
    let currentPath = this.path;
    return {
      next: async () => {
        try {
          if (!currentPath) {
            return { done: true };
          }
          let files = await this.readDir(currentPath);
          if (files.length === 0) {
            console.log(
              c.blue(`files length is ${files.length} for ${currentPath}`)
            );
          }

          currentPath = this.remainingDirs.shift();
          return { done: false, value: files };
        } catch (error) {
          return console.error(
            `something went wrong reading the files and dirs ${error.message}`
          );
        }
      },
    };
  }
}
