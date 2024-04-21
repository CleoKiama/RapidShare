import { dialog } from "electron";
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
      this.onFileSelect(filePaths[0], address, canceled)
    } else {
      const { filePaths, canceled } = await dialog.showOpenDialog(WindowAndListenerSetup.BrowserWindow, {
        properties: ["showHiddenFiles", "openFile"],
        title: "select file to send",
        buttonLabel: "send"
      })
      this.onFileSelect(filePaths[0], address, canceled)
    }

  }
  onFileSelect(filePaths, address, canceled) {
    if (!canceled) {
      startSending.start(filePaths, address)
    }
  }
  setUpFileDialogue() {
    ipcMain.handle('dialog:openFile', async (_, address, type) => {
      await this.openFileDialogue(address, type)
    })

  }
}

// export default new HandleFileDialogLogic()


