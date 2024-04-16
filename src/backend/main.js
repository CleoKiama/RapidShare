import createMulticastListener from './multicastListener.js'
import startBroadCaster from './broadCast.js'
import DeviceStatusUpdater from './deviceStatusUpdater.js'
import RestartBroadCaster from './restartBroadCaster.js'
import onDeviceFound from './deviceDiscovery.js'
import setUpFileDialogue from './fileDialog.js'
import WindowAndListenerSetup from './mainWindowSetup.js'

export default function Main() {
  try {
    createMulticastListener()
    startBroadCaster()
    DeviceStatusUpdater()
    RestartBroadCaster()
    // to update the ui for found devices
    onDeviceFound(WindowAndListenerSetup.returnWebContents())
    // set up the file dialogue listener
    setUpFileDialogue()
  } catch (error) {
    console.log(`something went wrong in the backend ${error.message}`)
  }
}
