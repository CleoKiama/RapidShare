import c from 'ansi-colors'
import updateUi from './updateUi.js'
import DestinationResolver from './destinationResolver.js'


export default async function Demultiplexer(source) {
  let writeToDisk = new DestinationResolver()
  let pendingWriteOperations = 0
  let currentLength = null
  let currentPath = null
  let totalSizeReceived = 0
  source.on('readable', () => {
    let chunk
    if (currentLength === null) {
      chunk = source.read(4)
      currentLength = chunk && chunk.readUInt32BE(0)
    }
    if (currentLength === null) {
      //wait for the full packet
      return null
    }
    chunk = source.read(currentLength)
    if (chunk === null) {
      return null
    }
    let progress = chunk.readUInt8(0)
    let pathLength = chunk.readUInt8(1)
    currentPath = chunk.toString('utf8', 2, 2 + pathLength)
    let contentBuffer = Buffer.alloc(chunk.length - pathLength - 2)
    if ('length' in contentBuffer)
      if (contentBuffer.length === 0) {
        contentBuffer = null
      } else chunk.copy(contentBuffer, 0, 2 + pathLength, chunk.length)
    if (contentBuffer) {
      totalSizeReceived += contentBuffer.length
      updateUi.updateProgress(progress, totalSizeReceived)
    } else updateUi.updateProgress(progress, 0)
    pendingWriteOperations += 1
    try {
      writeToDisk.saveToFileSystem(currentPath, contentBuffer).then(() => pendingWriteOperations -= 1)
    } catch (error) {
      console.error(c.red(error.message))
    }
    currentLength = null
    currentPath = null
  })

  return new Promise((resolve, reject) => {
    source.once('end', () => {
      console.log(c.magentaBright('The socket end event fired waiting for pending write operations'))
      // remember to handle pending write operations
      let interval = setInterval(() => {
        if (pendingWriteOperations === 0) {
          clearInterval(interval)
          console.log(c.blue(`pending writeOperations at the time of exiting  ${pendingWriteOperations}`))
          writeToDisk.cleanUp()
          resolve()
        }
      }, 700)
    })
    source.once('error', (err) => {
      //TODO might need to do better cleanup here instead of just resolving
      writeToDisk.cleanUp()
      reject('something went wrong demuxing ' + err.message)
    })
  })
}
