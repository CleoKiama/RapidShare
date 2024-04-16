import { dialog } from "electron";
import c from 'ansi-colors'
import { ipcMain } from 'electron'
import WindowAndListenerSetup from './mainWindowSetup.js'

class HandleFileDialogLogic {
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
      console.log(c.blue(filePaths))
    }
  }

}

let fileDialogueHandle = new HandleFileDialogLogic()

export default function setUpFileDialogue() {
  ipcMain.handle('dialog:openFile', async (_, address, type) => {
    await fileDialogueHandle.openFileDialogue(address, type)
  })

}
