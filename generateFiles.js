import { readdir } from "fs/promises";

export default class GenerateFiles {
  constructor(basePath, concurrency) {
    this.path = basePath;
    this.concurrency = concurrency;
    this.emptyDirs = [];
    this.remainingDirs = [];
    this.files = [];
  }
  async readDir(path) {
    const foundFiles = [];
    const found = await readdir(path, { withFileTypes: true });
    for (const dirent of found) {
      if (dirent.isFile()) {
        foundFiles.push(`${path}/${dirent.name}`);
      } else if (dirent.isDirectory()) {
        this.remainingDirs.push(`${path}/${dirent.name}`);
      }
    }
    if (foundFiles.length !== 0) {
      this.files.push(...foundFiles);
    } else this.emptyDirs.push(path);
  
  }
  [Symbol.asyncIterator]() {
    let currentPath = this.path;
    return {
      next: async () => { 
        try {
          if (!currentPath&&this.files.length===0) {
            return { done: true };
          }
           
          if(this.files.length <= 4 && currentPath) {
            await this.readDir(currentPath);
          }
          const subset = this.files.splice(0,4)
          currentPath = this.remainingDirs.shift();
           if(subset.length===0 ) {
            let emptyDir =  this.emptyDirs.shift()
            return {
              done: false, 
              value : {
                empty : true , 
                path : emptyDir
              }
            }
           } 
           return { done: false, value : subset };
        } catch (error) {
           console.error(
            `something went wrong reading the files and dirs ${error.message}`
          );
          return { done: true };
        }
      },
    };
  }
}
