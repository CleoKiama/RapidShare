import createStreamSources from './createFileStreams.js'
import GenerateFiles from './generateFiles.js'
import path from 'path'
import c from 'ansi-colors'
import { once } from 'node:events'
import { Transform } from 'stream'
import { pipeline } from 'node:stream/promises'
import TransferProgress from './transferProgress.js'

export function createPacket(path, chunk, progress) {
  if (!progress && typeof (progress) !== "number") throw { message: "progress must be a number" }
  const pathBuffer = Buffer.from(path)
  const packet = Buffer.alloc(4 + 1 + 1 + pathBuffer.length + (chunk ? chunk.length : 0))
  packet.writeUInt32BE(1 + 1 + pathBuffer.length + (chunk ? chunk.length : 0), 0)
  packet.writeUInt8(progress, 4)
  packet.writeUInt8(pathBuffer.length, 5)
  pathBuffer.copy(packet, 6, 0, pathBuffer.length)
  chunk && chunk.copy(packet, 6 + pathBuffer.length, 0, chunk.length)
  return packet
}


export default async function multiplexer(rootPath, destination) {
  try {
    //for now a max concurrency of 3 files work 4 has problems 
    const fileGenerator = new GenerateFiles(rootPath, 2)
    const iterator = fileGenerator[Symbol.asyncIterator]()
    let iteratorResult = await iterator.next()
    while (!iteratorResult.done) {
      if (Object.hasOwn(iteratorResult.value, 'empty')) {
        await sendEmptyDirPacket(
          rootPath,
          iteratorResult.value.path,
          destination
        )
        iteratorResult = await iterator.next()
        continue
      }
      await awaitSendPackets(rootPath, iteratorResult.value, destination)
      iteratorResult = await iterator.next()
    }
  } catch (error) {
    console.error(
      c.redBright(`error happened multiplexing  : ${error.message}`)
    )
    return Promise.reject(error)
  }
  console.log(c.yellow('multiplexer all done remember to end the socket now'))
}
const sendEmptyDirPacket = async (rootPath, emptyDirPath, destination) => {
  let relativePath
  const basename = `/${path.basename(rootPath)}`
  // **handling the case where the first emptyDir is also empty
  // ** as in no files but may have other nested Empty Dirs
  if (emptyDirPath === rootPath) relativePath = basename
  else relativePath = `${basename}${emptyDirPath.substring(rootPath.length)}`
  let progress = 40
  let drain = destination.write(createPacket(relativePath, null, progress), (err) => {
    if (err) return Promise.reject(err)
  })
  if (!drain) return await once(destination, 'drain')
}

function awaitSendPackets(rootPath, files, destination) {
  let sources = createStreamSources(files)
  let pendingWritingOperations = []
  return new Promise((resolve, reject) => {
    // ** files will always be four files unless changed
    while (files.length > 0) {
      const currentSource = sources.shift()
      const currentPath = files.shift()
      //TODO want to change this to forEach 
      if (!currentPath) return
      const basename = path.basename(rootPath)
      const relativePath = `/${basename}${currentPath.substring(rootPath.length)}`
      let sendFilePromise = sendFile(relativePath, currentSource, destination)
      pendingWritingOperations.push(sendFilePromise)
    }
    Promise.all(pendingWritingOperations).then(resolve, reject)
  })
}


const sendFile = (relativePath, sourceFile, destination) => {
  const transformToPacket = new Transform({
    transform(chunk, encoding, callback) {
      let progress = TransferProgress.setProgress(chunk.length)
      let packet = createPacket(relativePath, chunk, progress)
      this.push(packet)
      callback()
    }
  })
  return new Promise((resolve, reject) => {
    try {
      pipeline(sourceFile, transformToPacket, destination, {
        end: false
      }).then(() => {
        const endOfFileMessage = 'all done'
        destination.write(
          createPacket(
            relativePath,
            Buffer.from(endOfFileMessage),
            100
          ),
          (err) => {
            if (err) return reject(err)
            resolve()
          }
        )

      })
    } catch (err) {
      console.error(
        c.red(
          `error happened while reading file ${relativePath} : ${err.message}`
        )
      )
      reject(err)
    }

  })

}


