import { stat } from "fs/promises";

export default async function identifyPath(path) {
    const stats = await stat(path);
    if (stats.isDirectory()) {
      return {
        isDir: true,
        isFile: false,
      };
    } else if (stats.isFile()) {
      return {
        isDir: false,
        isFile: true,
      };
    }
 
}

