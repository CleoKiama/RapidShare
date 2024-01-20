import { readdir, stat } from "fs/promises";
import eachLimit from 'async/eachLimit.js';


function bytesToMB(bytes) {
  const megabytes = bytes / (1024 * 1024);
  return parseFloat(megabytes.toFixed(4));
}

 export async function returnFiles (path) {
   const files = [];
  async function recursiveReadDir(path) {
   
    let found = await readdir(path,{withFileTypes: true,});
         for(const value of found ) {
             if(value.isFile()) {
                  files.push(`${path}/${value.name}`)
             }
             if(value.isDirectory()) {
                await recursiveReadDir(`${path}/${value.name}`)
             }
         }
 }
   
  await recursiveReadDir(path)
  
  return files
 }


export default async function readFilesSize(path) {
  let totalSize = 0;
 function readFileSize(file,callback) {
    stat(file).then((stats)=>{
       totalSize += stats.size
     callback(null)
    }).catch(error=>callback(error))      
}
  const files = await returnFiles(path)
  await eachLimit (files,10,readFileSize)
  return bytesToMB(totalSize)
}

