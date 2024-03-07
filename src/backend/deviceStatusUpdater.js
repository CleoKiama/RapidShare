import { webContents } from '../main/main.js'
import { deviceDiscovery, foundDevices } from './deviceDiscovery.js'
import DeviceStatusMonitor from './deviceStatusMonitor.js'

export default function DeviceStatusUpdater() {
    deviceDiscovery.once('end', () => {
        DeviceStatusMonitor.start()
    })
    DeviceStatusMonitor.on('offline', (offlineDevices) => {
        console.log("device went offline ",offlineDevices)
        let onlineDevices = foundDevices.devices.filter(
            (device) => !offlineDevices.includes(device)
        )
        foundDevices.devices =  onlineDevices
        webContents.send("foundDevicesUpdate",foundDevices)
    })
}
