import c from 'ansi-colors'

class TransferProgress {
  constructor() {
    this.totalSize = 0
    this.webContents = null
  }
  updateTotalSize(size) {
    if (typeof size !== 'number')
      throw { message: "tried to update size with value that is not a number" }
    else this.totalSize = size
  }
  setwebContents(webContents) {
    this.webContents = webContents
  }
  setProgress(bytes) {
    let percentageProgress;
    // Special case for empty directories
    if (this.totalSize === 0 && bytes === 0) {
      percentageProgress = 100;
    } else {
      percentageProgress = Math.floor((bytes / this.totalSize) * 100);
    }
    this.updateUi(percentageProgress, bytes);
    return percentageProgress;
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




