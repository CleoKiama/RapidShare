import { dialog } from "electron";
import c from 'ansi-colors'
import { ipcMain } from 'electron'
import WindowAndListenerSetup from './mainWindowSetup.js'
import startSending from "./startSending.js";


export default class HandleFileDialogLogic {
  constructor() {
    this.setUpFileDialogue()
  }
  async openFileDialogue(address, type) {
    if (type === 'folder') {
      const { filePaths, canceled } = await dialog.showOpenDialog(WindowAndListenerSetup.BrowserWindow, {
        properties: ['openDirectory', "showHiddenFiles"],
        title: "select folder to send",
        buttonLabel: "send"
      })
      this.onFileSelect(filePaths, address, canceled)
    } else {
      const { filePaths, canceled } = await dialog.showOpenDialog(WindowAndListenerSetup.BrowserWindow, {
        properties: ["showHiddenFiles", "openFile"],
        title: "select file to send",
        buttonLabel: "send"
      })
      this.onFileSelect(filePaths, address, canceled)
    }

  }
  onFileSelect(filePaths, address, canceled) {
    if (!canceled) {
      // for now I will not pass port but let it use the default arg for port 
      startSending.start(filePaths, address)
      console.log(c.blue(filePaths))
    }
  }
  setUpFileDialogue() {
    ipcMain.handle('dialog:openFile', async (_, address, type) => {
      await this.openFileDialogue(address, type)
    })

  }
}

// export default new HandleFileDialogLogic()


