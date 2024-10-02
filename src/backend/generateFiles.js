import path from "node:path"
import fs from "fs-extra";
import c from "ansi-colors"

export default class FileGenerator {
  constructor(basePath, concurrency) {
    this.basePath = basePath;
    this.concurrency = concurrency;
    this.emptyDirs = [];
    this.remainingDirs = [];
    this.files = [];
  }

  async readDirectory(currentPath) {
    const foundFiles = [];
    const found = await fs.readdir(currentPath, { withFileTypes: true });

    for (const dirent of found) {
      if (dirent.isFile()) {
        foundFiles.push(path.resolve(currentPath, dirent.name))
      } else if (dirent.isDirectory()) {
        this.remainingDirs.push(path.resolve(currentPath, dirent.name));
      }
    }

    if (foundFiles.length > 0) {
      this.files.push(...foundFiles);
    } else {
      this.emptyDirs.push(currentPath);
    }
  }

  [Symbol.asyncIterator]() {
    let currentPath = this.basePath;
    let isInitialPath = true;

    return {
      next: async () => {
        try {
          // First, process the initial path
          if (isInitialPath) {
            await this.readDirectory(currentPath);
            isInitialPath = false;
          }

          // Process remaining directories
          while (this.remainingDirs.length > 0 && this.files.length < this.concurrency) {
            const nextDir = this.remainingDirs.shift();
            await this.readDirectory(nextDir);
          }

          // Return files if available
          if (this.files.length > 0) {
            const fileBatch = this.files.splice(0, this.concurrency);
            return { done: false, value: fileBatch };
          }

          // Return empty directories if available
          if (this.emptyDirs.length > 0) {
            const nextEmptyDir = this.emptyDirs.shift();
            console.log(c.blue(this.emptyDirs))
            return {
              done: false,
              value: {
                empty: true,
                path: nextEmptyDir
              }
            };
          }

          // If no more files or directories to process, we're done
          if (this.remainingDirs.length === 0) {
            return { done: true };
          }

          // Process next directory in the next iteration
          currentPath = this.remainingDirs.shift();
          await this.readDirectory(currentPath);
          return this.next();

        } catch (error) {
          throw (error)
        }
      },
    };
  }
}
