import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  on: (channel, func) => {
    ipcRenderer.on(channel, func)
  },
  removeListener: (channel, func) => {
    ipcRenderer.removeListener(channel, func)
  },
  async invoke(channel) {
    return ipcRenderer.invoke(channel)
  },
  openFileDialog: (address, type) => ipcRenderer.invoke('dialog:openFile', address, type),
  openInExpoler: (path) => ipcRenderer.invoke('openInExplorer', path)
})
