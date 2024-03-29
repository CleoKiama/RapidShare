import c from 'ansi-colors'
import thisMachineAddress from './currentAssignedAddress.js'
import { createServer } from 'net'
//import startWrite from '../backend/writeFiles.js'


export const address = thisMachineAddress()
export const defaultClientListeningPort = 3000

function startServer() {
  const serverSocket = createServer({
    keepAlive: true,
  })
  serverSocket.listen(
    {
      host: address,
      port: defaultClientListeningPort,
    },
    () => {
      console.log(
        c.green(
          `tcp server ready on ${address} and ${defaultClientListeningPort}`
        )
      )
    }
  )
  return serverSocket
}

export const server = startServer()

//TODO should stop the pinging once a connection arrives but leave the multicast server online
/* const connectionListener = (socket) => {
    startWrite(socket)
    removeConnectionListener()
}
/* export const addConnectionListener = () => {
    server.on('connection', connectionListener)
}

export const removeConnectionListener = () => {
    server.removeListener('connection', connectionListener)
} */


