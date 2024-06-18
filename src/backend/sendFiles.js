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
import { transferController } from './abortController.js'
import { pipeline } from 'stream/promises'
import { Transform } from 'stream'


export async function returnFileStream(rootPath, destination) {
  const { signal } = transferController
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

export async function establishConnection(clientPort, clientAddress) {
  let clientSocket = createConnection({
    port: clientPort,
    host: clientAddress,
    keepAlive: true,
  })
  console.log(c.blue(`waiting for a connection to peer ${clientAddress}`))
  return new Promise((resolve, reject) => {
    clientSocket.once('error', reject)
    once(clientSocket, 'connect').then(() => {
      console.log(c.green(`connected to peer ${clientAddress}`))
      resolve(clientSocket)
    })
  })

}

export const cancel = () => {
  transferController.abort()
}

export default async function transferFiles(rootPath, port, peerAdr) {
  try {
    console.log('establishConnection....')
    var peerSocket = await establishConnection(
      port,
      peerAdr
    )
    let totalSize = await GetFilesSize(rootPath)
    TransferProgress.setTotalSize(totalSize)
    const { isDir } = await identifyPath(rootPath)
    isDir
      ? await multiplexer(rootPath, peerSocket)
      : await returnFileStream(rootPath, peerSocket)
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
  //** add back the connection Listener when done */
}

