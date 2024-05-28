import { promisify } from 'util';
import identifyPath from "./pathType.js";
import fs from 'fs-extra';
import fastFolderSize from "fast-folder-size";
import path from 'path'


const asyncFastFolderSize = promisify(fastFolderSize);

//remember to remove getfoldersize from the list of dependencies

const getFileSize = async (path) => {
  const { size } = await fs.stat(path)
  return size
}

async function getDirectorySize(directoryPath) {
  let totalSize = 0;

  const files = await fs.promises.readdir(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      totalSize += await getDirectorySize(filePath); // Recursive call for directories
    } else {
      totalSize += stat.size;
    }
  }

  return totalSize;
}
async function GetFilesSize(path) {
  const { isDir } = await identifyPath(path)
  if (isDir) {
    if (process.platform === 'win32') {
      return await getDirectorySize(path)
    } else {
      return await asyncFastFolderSize(path)
    }
  } else {
    return await getFileSize(path)
  }
}

export default GetFilesSize
