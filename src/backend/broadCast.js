import dgram from 'dgram'
import { type, userInfo } from 'os'
import c from 'ansi-colors'
import { clearInterval } from 'timers'
import thisMachineAddress from './currentAssignedAddress.js'
import {addDevice,deviceDiscovery,foundDevices } from './deviceDiscovery.js'
import {
    bindingPort as multicastAdrPort,
    multicastAddress,
} from './multicastListener.js'

export const broadCastUdp = dgram.createSocket('udp4')

export default function startBroadCaster () {
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
const  broadCastDevice = () => {
    const broadCastInterval = setInterval(() => {
        if (foundDevices.devices.length > 0) {
            clearInterval(broadCastInterval)

            return setTimeout(() => {
                deviceDiscovery.emit('end')
                broadCastUdp.close()
            }, 1500)
        }
        sendUserData()
    }, 2000)
}

broadCastUdp.bind((error) => {
    if (error) {
        console.error(error.message)
        broadCastUdp.close()
    }
    broadCastUdp.addMembership(multicastAddress)
    const { address, port } = broadCastUdp.address()
    console.log(c.green(`broadCaster is listening on ${address}:${port}`))
    broadCastDevice()
})

broadCastUdp.on('message', (msg, rinfo) => {
    if (rinfo.address === thisMachineAddress()) return
    const clientPort = 3000
    const deviceFound = JSON.parse(msg.toString())
    const deviceFoundInfo = {
        ...deviceFound,
        address: rinfo.address,
        port: clientPort,
    }
    console.log(c.yellow(`broadCaster received message from device below .. `))
    if (addDevice(deviceFoundInfo))
    return deviceDiscovery.emit('deviceFound', foundDevices)
})
   
}
