import mainWindowSetup from "./mainWindowSetup";
import c from 'ansi-colors'

class UpdateUi {

  onTransferStart() {
    const { webContents } = mainWindowSetup.browserWindowRef()
    webContents.send('transferStart', true)
  }
  onTransferEnd() {
    // emit transfer end but set the state to false to 
    // stop rendering the sendUI
    const { webContents } = mainWindowSetup.browserWindowRef()
    webContents.send('transferEnd', false)
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

}

export default new UpdateUi()
