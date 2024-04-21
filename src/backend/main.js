import bonjourDeviceDiscovery from "./bonjourDeviceDiscovery.js"
import HandleFileDialogLogic from './fileDialog.js'
import TransferServer from "./transferInterface.js"

export default function Main() {
  bonjourDeviceDiscovery.start()
  new HandleFileDialogLogic()
  TransferServer.startServer()
}
