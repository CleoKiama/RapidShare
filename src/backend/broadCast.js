import dgram from 'dgram'
import { type, userInfo } from 'os'
import c from 'ansi-colors'
import { clearInterval } from 'timers'
import { addDevice, deviceDiscovery, foundDevices } from './deviceDiscovery.js'
import {
    bindingPort as multicastAdrPort,
    multicastAddress,
} from './multicastListener.js'

 var broadCastUdp 

export default function startBroadCaster() {
      broadCastUdp = dgram.createSocket('udp4')
    broadCastUdp.on('error', (error) => {
        broadCastUdp.close()
        throw error
    })
    const sendUserData = () => {
        const deviceDetails = {
            ...userInfo(),
            platform: type(),
        }
        const user = JSON.stringify(deviceDetails)
        broadCastUdp.send(user, multicastAdrPort, multicastAddress, (error) => {
            if (error) {
                throw error
            }
        })
    }
    const broadCastDevice = () => {
        const broadCastInterval = setInterval(() => {
            if (foundDevices.devices.length > 0) {
                clearInterval(broadCastInterval)

                return setTimeout(() => {
                    deviceDiscovery.emit('end')
                    broadCastUdp.removeListener('message',messageListener)
                    broadCastUdp.close()
                }, 1500)
            }
            sendUserData()
        }, 2000)
    }

    broadCastUdp.bind((error) => {
        if (error) {
            broadCastUdp.close()
            throw error
        }
        broadCastUdp.addMembership(multicastAddress)
        broadCastUdp.setMulticastLoopback(false)
        const { address, port } = broadCastUdp.address()
        console.log(c.green(`broadCaster is listening on ${address}:${port}`))
        broadCastDevice()
    })
      var messageListener = (msg, rinfo) => {
        const clientPort = 3000
        const deviceFound = JSON.parse(msg.toString())
        const deviceFoundInfo = {
            ...deviceFound,
            address: rinfo.address,
            port: clientPort,
        }
        console.log(
            c.yellow(`broadCaster received message from device below .. `)
        )
        if (addDevice(deviceFoundInfo))
            return deviceDiscovery.emit('deviceFound', foundDevices)
    }
    broadCastUdp.on('message',messageListener)
}
