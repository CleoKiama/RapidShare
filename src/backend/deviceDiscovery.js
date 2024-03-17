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

export default function onDeviceFound(webContents) {
    deviceDiscovery.on('deviceFound', (foundDevices) => {
        console.log(c.green("device discovered"))
        console.log(foundDevices)
     webContents.send('deviceFound',foundDevices)
    })
}

let fakeDevice = {
    devices : [
        {
            uid: 1001,
            gid: 1001,
            username: 'john',
            homedir: '/Users/john',
            shell: '/bin/zsh',
            address: '192.168.0.104',
            port: 4000,
            platform: 'Darwin',
        },
 
    ]
}
setTimeout(()=>{
    deviceDiscovery.emit('deviceFound',fakeDevice)
    console.log(c.green("device discovered"))
    console.log(fakeDevice)
},8000)
