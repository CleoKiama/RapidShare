

class TransferProgress {
  constructor() {
    this.totalSize = 0
    this.webContents = null
  }
  updateTotalSize(size) {
    this.totalSize = size
  }
  setwebContents(webContents) {
    this.webContents = webContents
  }
  setProgress(bytes) {
    let percentageProgress = Math.floor((bytes / this.totalSize) * 100)
    this.updateUi(percentageProgress, bytes)
    return percentageProgress
  }
  setTotalSize(size) {
    this.totalSize = size
  }
  updateUi(percentageProgress, bytesTransferred) {
    this.webContents.send("fileProgress", {
      percentageProgress: percentageProgress,
      bytesTransferred: bytesTransferred
      //update the ui and tests for that 
    })
  }
}

export default new TransferProgress()

