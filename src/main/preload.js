import { contextBridge,ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
    on : (channel,func) =>{
           ipcRenderer.on(channel,func)
    },
    removeListener : (channel,func) =>{
        ipcRenderer.removeListener(channel, func)
    },
    this_device : async () =>{
        return ipcRenderer.invoke('thisDevice')
    }
})
