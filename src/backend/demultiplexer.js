import c from 'ansi-colors'
import DestinationResolver from './destinationResolver.js'
import TransferProgress from './transferProgress.js'

export default async function Demultiplexer(source) {
  let DestinationResolverInstance = new DestinationResolver()
  let pendingWriteOprations = 0
  let currentLength = null
  let currentPath = null
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
    console.log(c.green(progress))
    let pathLength = chunk.readUInt8(1)
    currentPath = chunk.toString('utf8', 2, 2 + pathLength)
    let contentBuffer = Buffer.alloc(chunk.length - pathLength - 2)
    if ('length' in contentBuffer)
      if (contentBuffer.length === 0) {
        contentBuffer = null
      } else chunk.copy(contentBuffer, 0, 2 + pathLength, chunk.length)
    if (contentBuffer) {
      TransferProgress.updateUi(progress, contentBuffer.length)
    } else TransferProgress.updateUi(progress, 0)
    pendingWriteOprations += 1
    DestinationResolverInstance.saveToFileSystem(currentPath, contentBuffer).then(() => pendingWriteOprations -= 1)
    currentLength = null
    currentPath = null
  })

  return new Promise((resolve, reject) => {
    source.once('end', () => {
      console.log(c.magentaBright('The socket end event fired waiting for pending write operations'))
      // remember to handle pending write operations
      let interval = setInterval(() => {
        if (pendingWriteOprations === 0) {
          clearInterval(interval)
          console.log(c.blue(`pending writeOperations at the time of exiting  ${pendingWriteOprations}`))
          resolve()
        }
      }, 700)
    })
    source.once('error', (err) => {
      console.log(
        c.red(`error from demux from source.on(err) ${err.message} `)
      )
      //TODO might need to do better cleanup here instead of just resolving
      reject(err.message)
    })
  })
}
