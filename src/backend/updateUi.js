import formatBytes from "./formatBytes";
import mainWindowSetup from "./mainWindowSetup";
import c from 'ansi-colors'

class UpdateUi {

  onTransferStart() {
    const { webContents } = mainWindowSetup.browserWindowRef()
    console.log(c.magenta('sending transferring event now'))
    webContents.send('transferring', true)
  }
  onTransferEnd() {
    // emit transfer end but set the state to false to 
    // stop rendering the sendUI
    const { webContents } = mainWindowSetup.browserWindowRef()
    webContents.send('transferring', false)
  }
  updateDevices(foundDevices) {
    console.log('updateUi.js line 16')
    console.log(foundDevices)
    const { webContents } = mainWindowSetup.browserWindowRef()
    setTimeout(() => {
      console.log(c.magenta('updating ui after threshHold'))
      webContents.send('deviceFound', foundDevices)
    }, 3000);
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
