import c from 'ansi-colors'
import bonjour from "bonjour";
import updateUi from "./updateUi.js";
import { ipcMain } from 'electron';
import { platform } from 'os'
import thisMachineAddress from './currentAssignedAddress.js';

class BonjourDeviceDiscovery {
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
    this.returnToUi()
  }
  getfoundDevices() {
    return this.foundDevices
  }
  start() {
    this.browser.start()
  }
  stop() {
    this.browser.stop()
  }
  verifyDevices(deviceInfo) {
    if (platform() === 'win32', deviceInfo.address === thisMachineAddress()) {
      return console.log("matches thus returning")
    }
    if (this.addDevice(deviceInfo)) {
      console.log(deviceInfo)
      updateUi.updateDevices(this.foundDevices)
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
      if (platform() === 'win32' && service.txt.address === thisMachineAddress()) {
        return
      }
      console.log(service.txt)
      this.removeDevice(service.txt)
    })
  }
  returnToUi() {
    ipcMain.handle("currentDevices", () => {
      return this.foundDevices
    })
  }
}

export default new BonjourDeviceDiscovery()

