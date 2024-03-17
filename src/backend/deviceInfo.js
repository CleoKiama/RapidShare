import os from 'os'
import { ipcMain } from 'electron'


export default function respondWithDeviceInfo() {
    
    ipcMain.handle('thisDevice', () => {
        return {
            type: os.type(),
            userInfo: os.userInfo(),
        }
    })
}
