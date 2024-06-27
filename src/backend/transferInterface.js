import { createServer } from 'net'
import startWrite from '../backend/startWrite.js'
import bonjour from 'bonjour'
import os from 'os'
import { MonitorNetwork } from './currentAssignedAddress.js'

export var defaultClientListeningPort = 4000

class TransferServer {
  constructor() {
    this.server
    this.servicePublished
  }
  startServer(address) {
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
      }
    )

  }
  async connectionListener(socket) {
    // this.server.removeListener('connection', this.connectionListener)
    startWrite(socket)
  }
  addConnectionListener() {
    this.server.once('connection', this.connectionListener.bind(this))
  }
  removeConnectionListener() {
    this.server.removeListener('connection', this.connectionListener.bind(this))
  }
  publishServer(address) {
    this.servicePublished = bonjour({
      loopback: false,
    }).publish(
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
  initiate() {
    MonitorNetwork((address) => {
      this.startServer(address)
      this.publishServer(address)
    })
  }
}


export default new TransferServer()

