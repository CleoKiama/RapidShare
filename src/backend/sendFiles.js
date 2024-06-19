import identifyPath from './pathType.js'
import { createPacket } from './multiplexer.js'
import { createConnection } from 'net'
import path from 'path'
import multiplexer from './multiplexer.js'
import { createReadStream } from 'node:fs'
import c from 'ansi-colors'
import { once } from 'events'
import GetFilesSize from './readFilesSize.js'
import TransferProgress from './transferProgress.js'
import { pipeline } from 'stream/promises'
import { Transform } from 'stream'


export async function returnFileStream(rootPath, destination, controller) {
  const { signal } = controller
  const relativePath = `/${path.basename(rootPath)}`
  const prepare_for_send = new Transform({
    transform(chunk, _, cb) {
      let progress = TransferProgress.setProgress(chunk.length)
      let packet = createPacket(relativePath, chunk, progress)
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
    console.log('establishConnection....')
    await once(peerSocket, 'connect')
    let totalSize = await GetFilesSize(rootPath)
    TransferProgress.setTotalSize(totalSize)
    const { isDir } = await identifyPath(rootPath)
    isDir
      ? await multiplexer(rootPath, peerSocket, controller)
      : await returnFileStream(rootPath, peerSocket, controller)
  } catch (error) {
    console.error(
      `something went wrong sending the file error : ${error.message}`
    )
    if (error.code === "ABORT_ERR") peerSocket.destroy(error)
    else {
      peerSocket.destroy()
      throw error
    }
  }
  console.log(c.cyan('all send operations done ending transferFiles now'))
  peerSocket.end(() => console.log('peer socket closed successfully'))

}

