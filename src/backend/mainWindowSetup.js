import {BrowserWindow} from 'electron'
import onDeviceFound from './deviceDiscovery.js'
import {ipcMain} from 'electron'
import  HandleFileDialogLogic from './fileDialog.js'

/* global MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, MAIN_WINDOW_WEBPACK_ENTRY */

export default class WindowAndListenerSetup { 
    constructor () {
        this.BrowserWindow 
        this.webContents
    }
    createWindow () {
        this.BrowserWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, }, })
        // and load the index.html of the app.
        this.BrowserWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
        //TODO  might need to remove this in production : Open the DevTools.
        this.BrowserWindow.webContents.openDevTools()
        this.webContents = this.BrowserWindow.webContents
    }
    onDeviceFound() {
        onDeviceFound(this.webContents)
    }
     openFileDialogListener(){
        ipcMain.handle('dialog:openFile',async (address)=>{
           await HandleFileDialogLogic(address,this.BrowserWindow)
        })
    }
}




