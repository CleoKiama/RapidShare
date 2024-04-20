import { BrowserWindow } from 'electron'

/* global MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, MAIN_WINDOW_WEBPACK_ENTRY */

class WindowAndListenerSetup {

  constructor() {
    this.BrowserWindow
  }
  createWindow() {
    this.BrowserWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    })
    // and load the index.html of the app.
    this.BrowserWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
    //TODO  might need to remove this in production : Open the DevTools.
    this.BrowserWindow.webContents.openDevTools()
  }
  browserWindowRef() {
    return this.BrowserWindow
  }
}

export default new WindowAndListenerSetup()

