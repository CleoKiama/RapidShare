import c from 'ansi-colors'
import bonjour from "bonjour";
import updateUi from "./updateUi.js";

export default class BonjourDeviceDiscovery {
  constructor() {
    this.foundDevices = { devices: [] }
    this.browser = bonjour().find({
      type: 'http'
    }, (service) => {
      let deviceInfo = {
        ...service.txt,
        port: service.port,
      }
      this.verifyDevices(deviceInfo)
    })
    this.monitorDevices()
  }
  start() {
    this.browser.start()
  }
  stop() {
    this.browser.stop()
  }
  verifyDevices(deviceInfo) {
    if (this.addDevice(deviceInfo)) {
      updateUi.updateDevices(this.foundDevices)
      // this.stop()
    }
  }
  addDevice(deviceInfo) {
    let deviceFound = false
    this.foundDevices.devices.forEach((device) => {
      if (device.address === deviceInfo.address) return (deviceFound = true)
    })
    if (!deviceFound) {
      this.foundDevices.devices.push(deviceInfo)
      return true
    }
    return false
  }
  removeDevice(offlineDevice) {
    let onlineDevices = this.foundDevices.devices.filter((device) => offlineDevice.address !== device.address)
    this.foundDevices.devices = onlineDevices
    updateUi.updateDevices(this.foundDevices)
  }
  monitorDevices() {
    this.browser.on('down', (service) => {
      console.log(c.red(`we have a service that is down`))
      console.log(service.txt)
      this.removeDevice(service.txt)
    })
  }
}



