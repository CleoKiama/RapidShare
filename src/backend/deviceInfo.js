import os from 'os'
import {ipcMain} from 'electron'
import c from 'ansi-colors'


export default  function respondWithDeviceInfo () {
 console.log(c.blue("handling once the thisDevice event "))
ipcMain.handle('thisDevice', () => {
    return {
        type: os.type(),
        userInfo : os.userInfo()
    }
})
  
 } 