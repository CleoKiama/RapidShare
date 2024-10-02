import DestinationResolver from './destinationResolver.js'
import updateUi from './updateUi.js'


export default function Demultiplexer(source, callback) {
  const writeToDisk = new DestinationResolver()
  let pendingWriteOperations = 0
  let currentLength = null
  let currentPath = null
  let totalSizeReceived = 0
  let readableEnded = false
  source.on('end', () => {
    readableEnded = true
    if (pendingWriteOperations === 0) {
      writeToDisk.cleanUp()
      callback(null)
    }
  })

  const handleReadable = () => {
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
    const progress = chunk.readUInt8(0)
    const pathLength = chunk.readUInt8(1)
    currentPath = chunk.toString('utf8', 2, 2 + pathLength)
    let contentBuffer = Buffer.alloc(chunk.length - pathLength - 2)
    if ('length' in contentBuffer)
      if (contentBuffer.length === 0) {
        contentBuffer = null
      } else chunk.copy(contentBuffer, 0, 2 + pathLength, chunk.length)
    if (contentBuffer) {
      totalSizeReceived += contentBuffer.length
      updateUi.updateProgress(progress, totalSizeReceived)
    }
    pendingWriteOperations += 1
    writeToDisk.saveToFileSystem(currentPath, contentBuffer, (error) => {
      if (error) return callback(error)
      pendingWriteOperations -= 1
      if (readableEnded && pendingWriteOperations === 0) {
        writeToDisk.cleanUp()
        callback(null)
      } else {
        if (pendingWriteOperations === 0) {
          process.nextTick(handleReadable)
        }

      }
    })

    currentLength = null
    currentPath = null
  }
  source.on('readable', handleReadable)
  source.once('error', (err) => {
    //TODO might need to do better cleanup here instead of just resolving
    writeToDisk.cleanUp()
    callback(err)
  })

}

