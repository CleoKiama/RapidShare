import { foundDevices } from './deviceDiscovery'
import { EventEmitter } from 'node:events'
import dgram from 'dgram'
import { setTimeout } from 'node:timers/promises'
import c from 'ansi-colors'
import { deviceDiscovery } from './deviceDiscovery.js'
import {
    bindingPort as multicastArdPort,
    multicastAddress,
} from './multicastListener.js'

class DeviceStatusMonitor extends EventEmitter {
    constructor() {
        super()
        this.pinger = dgram.createSocket('udp4')
        this.stopPing = false
    }
    startPing() {
        if (this.stopPing) return console.log('stopping the ping')
        this.ping().then((foundOfflineDevices) => {
            if (foundOfflineDevices.length > 0) {
                this.emit('offline', foundOfflineDevices)
            }
            this.startPing()
        })
    }
    async ping() {
        const onlineDevicesIndex = []
        const listener = (msg, rinfo) => {
            if (msg.toString() === 'pong') {
                console.log(
                    c.magentaBright('received pong so device should be online')
                )
                foundDevices.devices.forEach((element, index) => {
                    if (element.address === rinfo.address)
                        return onlineDevicesIndex.push(index)
                })
            }
        }
        const cleanUp = () => {
            this.pinger.removeListener('message', listener)
        }
        this.pinger.send('ping', multicastArdPort, multicastAddress)
        this.pinger.on('message', listener)
        await setTimeout(5000)
        cleanUp()
        // ** return devices that are offline
        return foundDevices.devices.filter(
            (device, index) => !onlineDevicesIndex.includes(index)
        )
    }
    start() {
        console.log(c.greenBright(`starting the pinging`))
        this.pinger.bind(() => {
            this.pinger.addMembership(multicastAddress)
            this.pinger.setMulticastLoopback(false)
            this.startPing()
            this.monitorRemainingDevices()
        })
    }
    monitorRemainingDevices() {
        this.on('offline', () => {
            if (foundDevices.devices.length === 0) {
                console.log(
                    c.blue('stopping the ping as there are no devices left')
                )
                this.stopPinging()
                console.log(
                    c.blue(
                        'waiting for a device to reconnect to restart the ping'
                    )
                )
                deviceDiscovery.once('deviceFound', () => {
                    console.log(
                        c.magenta('device reconnected restarting the ping now')
                    )
                    this.stopPing = false
                    this.startPing()
                })
            }
        })
    }
    stopPinging() {
        this.stopPing = true
    }
}

export default new DeviceStatusMonitor()
