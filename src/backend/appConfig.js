import os from 'os'
import { ipcMain, shell, dialog } from 'electron'
import WindowAndListenerSetup from './mainWindowSetup.js'


let userChoosenDestination = null

const config = {
  getDestinationPath: function() {
    const platform = os.platform()
    if (platform === 'win32') {
      const homeDir = os.homedir();
      if (userChoosenDestination) return userChoosenDestination
      return `${homeDir}/Downloads/RapidShare`;
    } else if (platform === 'linux') {
      const { username } = os.userInfo()
      if (userChoosenDestination) return userChoosenDestination
      return `/home/${username}/Downloads/RapidShare`
    } else if (platform === 'darwin') {
      const { username } = os.userInfo()
      if (userChoosenDestination) return userChoosenDestination
      return `/Users/${username}/Downloads/RapidShare`
    }
  },
}

async function handleDialog() {
  const { filePaths, canceled } = await dialog.showOpenDialog(WindowAndListenerSetup.BrowserWindow, {
    properties: ['openDirectory', "showHiddenFiles"],
    title: "Select save Dierctory",
    defaultPath: config.getDestinationPath(),
    buttonLabel: "select"
  })
  if (canceled) return 'canceled'
  userChoosenDestination = filePaths[0]
  return userChoosenDestination
}

const openInExplorer = async (_, path) => {
  return shell.openPath(path)
}
ipcMain.handle('dialog:handleSaveDirectory', handleDialog)
ipcMain.handle('getSaveDirectory', config.getDestinationPath)
ipcMain.handle('openInExplorer', openInExplorer)


export { config, handleDialog }
