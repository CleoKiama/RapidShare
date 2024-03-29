import fastFolderSize from "fast-folder-size";
import { promisify } from 'node:util'
import identifyPath from "./pathType.js";
import fs from 'fs-extra'


const getFolderSize = async (path) => {
  let asyncFastFolderSize = promisify(fastFolderSize)
  return await asyncFastFolderSize(path)
}

const getFileSize = async (path) => await fs.stat(path)

async function GetFilesSize(path) {
  const { isDir } = await identifyPath(path)
  if (isDir) return await getFolderSize()
  else return await getFileSize(path)
}


export default GetFilesSize
