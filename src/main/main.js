import { app, BrowserWindow, session } from 'electron'
import { join } from 'path'
import { platform } from 'process'
import respondWithDeviceInfo from '../backend/deviceInfo.js'
import onDeviceFound from '../backend/deviceDiscovery.js'
import Main from '../backend/main.js'

if (require('electron-squirrel-startup')) {
    app.quit()
}

var webContents
const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    })
    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
    //TODO  might need to remove this in production : Open the DevTools.
    mainWindow.webContents.openDevTools()
    webContents = mainWindow.webContents
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//content
app.on('ready', () => {
    respondWithDeviceInfo()
    session.defaultSession.protocol.registerFileProtocol(
        'static',
        (request, callback) => {
            const fileUrl = request.url.replace('static://', '')
            const filePath = join(
                app.getAppPath(),
                '.webpack/renderer',
                fileUrl
            )
            callback(filePath)
        }
    )
    createWindow()
    Main()
    onDeviceFound(webContents)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
