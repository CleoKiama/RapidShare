import formatBytes from "./formatBytes.js";
import mainWindowSetup from "./mainWindowSetup.js";
import c from 'ansi-colors'

class UpdateUi {

  onTransferStart() {
    const { webContents } = mainWindowSetup.browserWindowRef()
    webContents.send('transferring', true)
  }
  onTransferEnd() {
    // emit transfer end but set the state to false to 
    // stop rendering the sendUI
    const { webContents } = mainWindowSetup.browserWindowRef()
    webContents.send('transferring', false)
  }
  onError(error) {
    const { webContents } = mainWindowSetup.browserWindowRef()
    webContents.send('error', error)
  }
  updateDevices(foundDevices) {
    const browserWindow = mainWindowSetup.browserWindowRef()
    browserWindow.webContents.send('updateDevices', foundDevices)
  }
  updateProgress(percentageProgress, bytesTransferred) {
    const { webContents } = mainWindowSetup.browserWindowRef()
    webContents.send("fileProgress", {
      percentageProgress: percentageProgress,
      bytesTransferred: formatBytes(bytesTransferred)
      //update the ui and tests for that 
    })
  }
}


export default new UpdateUi()
