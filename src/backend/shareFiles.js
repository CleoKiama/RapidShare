import transferFiles from "./transferInterface.js";
import c from 'ansi-colors'
import { serverSocket,multicastServer } from "./transferInterface.js";
function main() {
    const rootPath = process.argv[2];
if (rootPath) {
  console.log(
    c.blueBright(`starting sharing the file with path : ${rootPath}`)
  );
  transferFiles(rootPath) .then(()=>{
    serverSocket.close()
    multicastServer.close()
  })
} else console.log(`rootPath is undefined :${rootPath}`);

}

main()