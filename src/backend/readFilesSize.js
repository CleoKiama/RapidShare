import fastFolderSize from "fast-folder-size";
import formatBytes  from './formatBytes.js'
import {promisify} from 'node:util'



export default  async  function GetFolderSize(path) {
    let asyncFastFolderSize   = promisify(fastFolderSize)
   let bytes = await  asyncFastFolderSize(path)
    return formatBytes(bytes)
}

 

