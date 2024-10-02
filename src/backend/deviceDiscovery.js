import { EventEmitter } from 'events'
import c from 'ansi-colors'


export const deviceDiscovery = new EventEmitter()
export const foundDevices = { devices: [] }

export function addDevice(deviceInfo) {
  let deviceFound = false
  foundDevices.devices.forEach((device) => {
    if (device.address === deviceInfo.address) return (deviceFound = true)
  })
  if (!deviceFound) {
    foundDevices.devices.push(deviceInfo)
    return true
  }
  return false
}

// updates the ui with devices found
export default function onDeviceFound(webContents) {
  deviceDiscovery.on('deviceFound', (foundDevices) => {
      )
      
    webContents.send('deviceFound', foundDevices)
  })
}


