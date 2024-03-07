import c from 'ansi-colors'
import DeviceStatusMonitor from './deviceStatusMonitor.js'
import { foundDevices } from './deviceDiscovery'
import startBroadCaster from './broadCast.js'

export default function RestartBroadCaster() {
    console.log(c.blue('restarting the broadCaster'))
    try {
        DeviceStatusMonitor.on('offline', () => {
            foundDevices.devices.length === 0 && startBroadCaster()
        })
    } catch (error) {
        return c.red(`error restarting the broadCaster ${error.message}`)
    }
}
