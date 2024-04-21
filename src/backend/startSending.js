import transferFiles from "./sendFiles";
import c from 'ansi-colors'
import updateUi from "./updateUi";
import BonjourDeviceDiscovery from "./bonjourDeviceDiscovery.js";

class StartSending {

  async start(filePaths, addressToMatch) {
    const { address, port } = BonjourDeviceDiscovery.getfoundDevices().devices.find((device) => device.address === addressToMatch)
    try {
      updateUi.onTransferStart()
      await transferFiles(filePaths, port, address)
      updateUi.onTransferEnd()
    } catch (error) {
      console.error(c.red(`error sending files ${error.message}`))
    }
  }
}

export default new StartSending()

