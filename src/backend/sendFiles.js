import { once } from 'node:events'
import { createConnection } from 'node:net'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import multiplexer, { createPacket } from './multiplexer.js'
import identifyPath from './pathType.js'
import GetFilesSize from './readFilesSize.js'
import TransferProgress from './transferProgress.js'


export async function returnFileStream(rootPath, destination, controller) {
  const { signal } = controller
  const relativePath = `/${path.basename(rootPath)}`
  const prepare_for_send = new Transform({
    transform(chunk, _, cb) {
      const progress = TransferProgress.setProgress(chunk.length)
      const packet = createPacket(relativePath, chunk, progress)
      this.push(packet)
      cb()
    },
    flush(cb) {
      const endMessage = Buffer.from('all done')
      this.push(createPacket(relativePath, endMessage, 100))
      cb()
    }
  })
  const fileStream = createReadStream(rootPath)
  await pipeline(fileStream, prepare_for_send, destination, { signal })
}


export default async function transferFiles(rootPath, port, peerAdr, controller) {
  try {
    var peerSocket = createConnection({
      port: port,
      host: peerAdr,
      keepAlive: true,
    })

    await once(peerSocket, 'connect')
    const totalSize = await GetFilesSize(rootPath)
    TransferProgress.setTotalSize(totalSize)
    const { isDir } = await identifyPath(rootPath)
    isDir
      ? await multiplexer(rootPath, peerSocket, controller)
      : await returnFileStream(rootPath, peerSocket, controller)
  } catch (error) {
    if (error.code === "ABORT_ERR") peerSocket.destroy(error)
    else {
      peerSocket.destroy()
      throw error
    }
  }
  peerSocket.end()
}

