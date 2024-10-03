import createStreamSources from './createFileStreams.js'
import FileGenerator from './generateFiles.js'
import path from 'path'
import { once } from 'node:events'
import { Transform } from 'node:stream'
import TransferProgress from './transferProgress.js'
import { pipeline } from 'node:stream/promises'


export function createPacket(path, chunk, progress) {
  const pathBuffer = Buffer.from(path)
  const packet = Buffer.alloc(4 + 1 + 1 + pathBuffer.length + (chunk ? chunk.length : 0))
  packet.writeUInt32BE(1 + 1 + pathBuffer.length + (chunk ? chunk.length : 0), 0)
  packet.writeUInt8(progress, 4)
  packet.writeUInt8(pathBuffer.length, 5)
  pathBuffer.copy(packet, 6, 0, pathBuffer.length)
  chunk && chunk.copy(packet, 6 + pathBuffer.length, 0, chunk.length)
  return packet
}


export default async function multiplexer(rootPath, destination, controller) {
  //for now a max concurrency of 3 files works but 4 has problems 
  const fileGenerator = new FileGenerator(rootPath, 2)
  const iterator = fileGenerator[Symbol.asyncIterator]()
  let iteratorResult = await iterator.next()
  while (!iteratorResult.done) {
    if (Object.hasOwn(iteratorResult.value, 'empty')) {
      await sendEmptyDirPacket(
        rootPath,
        iteratorResult.value.path,
        destination,
        controller
      )
    } else
      await awaitSendPackets(rootPath, iteratorResult.value, destination, controller)
    iteratorResult = await iterator.next()
  }
}

const sendEmptyDirPacket = async (rootPath, emptyDirPath, destination, controller) => {
  return await new Promise((resolve, reject) => {
    if (controller.signal.aborted) {
      const error = new Error("The operation was aborted")
      error.code = "ABORT_ERR"
      return reject(error)
    }
    const abortListener = () => {
      const error = new Error("The operation was aborted")
      error.code = "ABORT_ERR"
      reject(error)
    }
    controller.signal.addEventListener('abort', abortListener, {
      once: true
    })

    let relativePath
    const basename = `/${path.basename(rootPath)}`
    // **handling the case where the first emptyDir is also empty
    // ** as in no files but may have other nested Empty Dirs
    if (emptyDirPath === rootPath) relativePath = basename
    else relativePath = `${basename}${emptyDirPath.substring(rootPath.length)}`
    //TODO: This will be a bug later fix it
    const progress = TransferProgress.setProgress(0)
    const drain = destination.write(createPacket(relativePath, null, progress), (err) => {
      if (err) return Promise.reject(err)
    })
    if (!drain) once(destination, 'drain').then(() => {
      controller.signal.removeEventListener('abort', abortListener);
      resolve()
    }).catch(error => {
      controller.signal.removeEventListener('abort', abortListener);
      reject(error)
    })
    else {
      controller.signal.removeEventListener('abort', abortListener);
      resolve()
    }
  })
}

async function awaitSendPackets(rootPath, files, destination, controller) {
  const sources = createStreamSources(files)
  // let pendingWritingOperations = []
  // ** files will always be four files unless changed
  while (files.length > 0) {
    const currentSource = sources.shift()
    const currentPath = files.shift()
    if (!currentPath) return
    const basename = path.basename(rootPath)
    const relativePath = `/${basename}${currentPath.substring(rootPath.length)}`
    // let sendFilePromise = sendFile(relativePath, currentSource, destination)
    await sendFile(relativePath, currentSource, destination, controller)
    // pendingWritingOperations.push(sendFilePromise)
  }
  // await Promise.all(pendingWritingOperations)
}


const sendFile = async (relativePath, sourceFile, destination, controller) => {
  let progress;
  const transformToPacket = new Transform({
    transform(chunk, _, callback) {
      progress = TransferProgress.setProgress(chunk.length);
      const packet = createPacket(relativePath, chunk, progress);
      this.push(packet)
      callback();
    },
    flush(cb) {
      const endOfFileMessage = 'all done';
      const finalPacket = createPacket(relativePath, Buffer.from(endOfFileMessage), 100);
      cb(null, finalPacket)
    }
  });
  await pipeline(sourceFile, transformToPacket, destination, {
    signal: controller.signal,
    end: false
  })
};
