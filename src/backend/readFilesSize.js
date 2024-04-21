import fastFolderSize from "fast-folder-size";
import { promisify } from 'node:util';
import identifyPath from "./pathType.js";
import fs from 'fs-extra';

const getFolderSize = async (path) => {
  let asyncFastFolderSize = promisify(fastFolderSize)
  return await asyncFastFolderSize(path)
}

const getFileSize = async (path) => {
  const { size } = await fs.stat(path)
  return size
}

async function GetFilesSize(path) {
  const { isDir } = await identifyPath(path)
  if (isDir) return await getFolderSize(path)
  else return await getFileSize(path)
}

export default GetFilesSize
