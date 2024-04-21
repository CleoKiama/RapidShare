import updateUi from './updateUi.js'
import c from "ansi-colors"

class TransferProgress {
  constructor() {
    this.totalSize = 0
    this.currentlyTransferred = 0
  }
  updateTotalSize(size) {
    if (typeof size !== 'number')
      throw { message: "tried to update size with value that is not a number" }
    else this.totalSize = size
  }

  setProgress(bytes) {
    let percentageProgress;
    this.currentlyTransferred += bytes
    // Special case for empty directories
    if (this.totalSize === 0) {
      percentageProgress = 100;
    } else {
      percentageProgress = Math.floor((this.currentlyTransferred / this.totalSize) * 100);
    }
    if (Number.isNaN(percentageProgress)) {
      console.error(c.red(`something went wrong with the computation of progress value received : NAN for bytes ${bytes}`))
      updateUi.updateProgress(100, bytes);
      return 100;
    }
    console.log(c.greenBright(`computed percentage value ${percentageProgress}`))
    updateUi.updateProgress(percentageProgress, this.currentlyTransferred);
    return percentageProgress;
  }
  setTotalSize(size) {
    console.log(c.yellow(`setting the total size : ${size}`))
    this.totalSize = size
  }
  cleanUp() {
    this.currentlyTransferred = 0
    this.totalSize = 0
  }
}

export default new TransferProgress()




