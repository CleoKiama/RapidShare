import { receiveMode } from './transferInterface.js';
import c from 'ansi-colors'
import validatePath from "./validatePath.js";


  
async function main () {
  validatePath (process.argv[2])
    await receiveMode ()
}
