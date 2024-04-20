import transferFiles from "./sendFiles";
import c from 'ansi-colors'
import updateUi from "./updateUi";


class StartSending {

  async start(filePaths, port = 3000, address) {
    //TODO for now we are using a default port of 3000   
    //have the other devices say what port they are using incase 3000 is busy
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


