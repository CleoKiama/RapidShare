import c from 'ansi-colors'
import DestinationResolver from './destinationResolver.js'

export default async function Demultiplexer(source) {
    let DestinationResolverInstance = new DestinationResolver()
    let fsActivity = []
    let currentLength = null
    let currentPath = null
    source.on('readable', () => {
        let chunk
        if (currentLength === null) {
            chunk = source.read(4)
            currentLength = chunk && chunk.readUInt32BE(0)
        }
        if (currentLength === null) {
            console.log(`waiting for more data`)
            return null
        }
        chunk = source.read(currentLength)
        if (chunk === null) {
            console.log(`waiting for more data`)
            return null
        }
        let pathLength = chunk.readUInt8(0)
        currentPath = chunk.toString('utf8', 1, 1 + pathLength)
        let contentBuffer = Buffer.alloc(chunk.length - pathLength - 1)
        if (contentBuffer.length === 0) {
            contentBuffer = null
        } else chunk.copy(contentBuffer, 0, 1 + pathLength, chunk.length)
        console.log(c.green(`arrived ${currentPath} procceding to write it now`))
        let fsOperation = DestinationResolverInstance.saveToFileSystem(currentPath,contentBuffer)
        fsActivity.push(fsOperation)
        currentLength = null
        currentPath = null
    })

    return new Promise((resolve, reject) => {
        source.once('end', () => {
            console.log(c.magentaBright('The socket end event fired waiting for pending write operations'))
             Promise.all(fsActivity).then(resolve)
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
