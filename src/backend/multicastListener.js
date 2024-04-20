import dgram from 'dgram'
import c from 'ansi-colors'
import { type, userInfo } from 'os'
import { deviceDiscovery, addDevice, foundDevices } from './deviceDiscovery.js'

const bindingPort = 8080
const multicastAddress = '239.1.1.1'
let server

export default function createMulticastListener() {
  server = dgram.createSocket('udp4')
  let broadCastEnded = false
  deviceDiscovery.once('end', () => {
    broadCastEnded = true
  })
  server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`)
    server.close()
  })

  server.bind(bindingPort, () => {
    server.addMembership(multicastAddress)
    server.setMulticastTTL(128)
    server.setMulticastLoopback(false)
    let { address, port } = server.address()
    console.log(
      c.green(
        `multicast server listening to multicast group on adr : ${address}  port : ${port}`
      )
    )
  })
  const getThisDeviceDetails = () => {
    return {
      ...userInfo(),
      platform: type(),
    }
  }
  server.on('message', (msg, rinfo) => {
    if (msg.toString() === "ping") {
      console.log(c.green("pong"))
      server.send("pong", rinfo.port, rinfo.address, (error) => {
        if (error) {
          console.error(
            c.red(`error echoing back a response  ${error.message}`)
          )
        }
      })
      return
    }
    const defaultPeerPort = 3000
    console.log(c.blue(`received message from multicast: ${msg}`))
    console.log(c.yellow(`adr ${rinfo.address} : port => ${rinfo.port}`))
    console.log(c.magenta(`sending back a reply...`))
    const thisDeviceDetails = JSON.stringify(getThisDeviceDetails())
    const deviceFound = JSON.parse(msg.toString())

    server.send(thisDeviceDetails, rinfo.port, rinfo.address, (error) => {
      if (error) {
        console.error(
          c.red(`error echoing back a response  ${error.message}`)
        )
      }
    })
    if (broadCastEnded) {
      const deviceFoundDetails = {
        ...deviceFound,
        address: rinfo.address,
        port: defaultPeerPort,
      }
      addDevice(deviceFoundDetails) &&
        console.log(c.greenBright("emitting the device found event"))
      deviceDiscovery.emit('deviceFound', foundDevices)
    }
  })
  return server
}

export { server, bindingPort, multicastAddress }
