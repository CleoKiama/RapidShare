import c from 'ansi-colors'
import thisMachineAddress from './currentAssignedAddress.js'
import { createServer } from 'net'
import startWrite from '../backend/startWrite.js'
import bonjour from 'bonjour'
import os from 'os'

export const address = thisMachineAddress()
export var defaultClientListeningPort = 4000

class TransferServer {
  constructor() {
    this.server
    this.publishServer()
    this.servicePublished
  }
  startServer() {
    this.server = createServer({
      keepAlive: true,
    })
    this.server.listen(
      {
        host: address,
        port: defaultClientListeningPort,
      },
      () => {
        this.addConnectionListener()
        console.log(
          c.green(
            `tcp server ready on ${this.server.address().address} and ${defaultClientListeningPort}`
          )
        )
      }
    )

  }
  async connectionListener(socket) {
    await startWrite(socket)
    // ** once called do not allow any more connections
    // this might change if we allow sending to more 
    // than one device at a time 
    this.removeConnectionListener()
  }
  addConnectionListener() {
    this.server.on('connection', this.connectionListener)
  }
  publishServer() {
    this.servicePublished = bonjour().publish(
      {
        name: `${os.userInfo().username}_server`,
        type: 'http',
        port: defaultClientListeningPort,
        txt: {
          ...os.userInfo(),
          platform: os.type(),
          address: address
        }
      })
    this.servicePublished.start()
  }
  unpublish() {
    this.servicePublished.stop()
  }
  removeConnectionListener() {
    this.server.removeListener('connection', this.connectionListener)
  }

}


export default new TransferServer()

