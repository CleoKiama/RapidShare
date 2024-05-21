import { promisify } from 'util';
import identifyPath from "./pathType.js";
import fs from 'fs-extra';
import getFolderSize from 'get-folder-size';
import fastFolderSize from "fast-folder-size";

const getFolderSizeAsync = promisify(getFolderSize);
const asyncFastFolderSize = promisify(fastFolderSize);

const getFileSize = async (path) => {
  const { size } = await fs.stat(path)
  return size
}

async function GetFilesSize(path) {
  const { isDir } = await identifyPath(path)
  if (isDir) {
    if (process.platform === 'win32') {
      return await getFolderSizeAsync(path)
    } else {
      return await asyncFastFolderSize(path)
    }
  } else {
    return await getFileSize(path)
  }
}

export default GetFilesSize

