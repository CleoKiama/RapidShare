import identifyPath from './pathType.js'
import { createPacket } from './multiplexer.js'
import { createConnection } from 'net'
import path from 'path'
import multiplexer from './multiplexer.js'
import { createReadStream } from 'node:fs'
import c from 'ansi-colors'
import { once } from 'events'
import formatBytes from './formatBytes.js'
import GetFilesSize from './readFilesSize.js'
import TransferProgress from './transferProgress.js'

export async function returnFileStream(rootPath, destination) {
  const relativePath = `/${path.basename(rootPath)}`
  return new Promise((resolve, reject) => {
    const fileStream = createReadStream(rootPath)
    fileStream.on('data', (data) => {
      let progress = TransferProgress.setProgress(data.length)
      let packet = createPacket(relativePath, data, progress)
      destination.write(packet)
    })
    fileStream.on('end', () => {
      const endMessage = Buffer.from('all done')
      destination.write(createPacket(relativePath, endMessage, 100), () => {
        console.log(
          c.green(
            `total size of file sent ${formatBytes(destination.bytesWritten)}`
          )
        )
        resolve()
      })
    })
    fileStream.on('error', reject)
  })
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

export default async function transferFiles(rootPath, port, peerAdr) {
  try {
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
    peerSocket.end(() => {
      console.log(c.red('socket closed due to error'))
    })
  }
  console.log(c.green('all send operations done ending transferFiles now'))
  peerSocket.end(() => console.log('peer socket closed successfully'))
  //** add back the connection Listener when done */
  //addConnectionListener()
}

// transferFiles('/home/cleo/Pictures/logos', '192.168.0.109').then(() => {
//   console.log(c.magentaBright("transferFiles all done sending them files"))
// })
// transferFiles('/run/media/cleo/Library/books/dev books', '192.168.0.109').then(() => {
//   console.log(c.magentaBright("transferFiles all done sending them files"))
// })

