import createStreamSources from './createFileStreams.js'
import GenerateFiles from './generateFiles.js'
import path from 'path'
import c from 'ansi-colors'
import { once } from 'node:events'

export function createPacket(path, chunk) {
    if (chunk === null) {
        const pathBuffer = Buffer.from(path)
        const packet = Buffer.alloc(4 + 1 + pathBuffer.length)
        packet.writeUInt32BE(1 + pathBuffer.length, 0)
        packet.writeUInt8(pathBuffer.length, 4)
        pathBuffer.copy(packet, 5, 0, pathBuffer.length)
        return packet
    }
    const pathBuffer = Buffer.from(path)
    const packet = Buffer.alloc(4 + 1 + pathBuffer.length + chunk.length)
    packet.writeUInt32BE(1 + pathBuffer.length + chunk.length, 0)
    packet.writeUInt8(pathBuffer.length, 4)
    pathBuffer.copy(packet, 5, 0, pathBuffer.length)
    chunk.copy(packet, 5 + pathBuffer.length, 0, chunk.length)
    return packet
}

export default async function multiplexer(rootPath, destination) {
    try {
        const fileGenerator = new GenerateFiles(rootPath)
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
            await sendPacket(rootPath, iteratorResult.value, destination)
            iteratorResult = await iterator.next()
        }
    } catch (error) {
        console.error(
            c.redBright(`error happened multiplexing  : ${error.message}`)
        )
        return Promise.reject(error)
    }
    console.log(c.yellow('multiplexer all done ending the socket now'))
}
const sendEmptyDirPacket = async (rootPath, emptyDirPath, destination) => {
    let relativePath
    const basename = `/${path.basename(rootPath)}`
    // **handling the case where the first emptyDir is also empty
    // ** as in no files but may have other nested Empty Dirs
    if (emptyDirPath === rootPath) relativePath = basename
    else relativePath = `${basename}${emptyDirPath.substring(rootPath.length)}`
    let drain = destination.write(createPacket(relativePath, null), (err) => {
        if (err) return Promise.reject(err)
    })
    if (!drain) return await once(destination, 'drain')
}

async function sendPacket(rootPath, files, destination) {
    const receivedLengthOfFiles = files.length
    let sources = createStreamSources(files)
    let pendingWritingOperations = []
    return new Promise((resolve, reject) => {
        var awaitPendingWrites = () => {
            console.log(
                c.greenBright(
                    `waiting for the final all done messages to be sent`
                )
            )
            Promise.all(pendingWritingOperations).then(resolve)
        }
        while (files.length > 0) {
            const currentSource = sources.shift()
            const currentPath = files.shift()
            if (!currentPath) return
            const basename = path.basename(rootPath)
            const relativePath = `/${basename}${currentPath.substring(rootPath.length)}`
            currentSource.on('readable', function () {
                let chunk
                let drainListener
                const awaitDrain = () => {
                    if (drainListener) {
                        destination.removeListener('drain', drainListener)
                    }

                     drainListener = () => {
                        console.log(c.green("resuming sending after the drain event fired"))
                        readAndSend()
                        drainListener = null // Reset the listener
                    }
                    destination.once('drain', drainListener)
                }
                const readAndSend = () => {
                    while ((chunk = this.read()) !== null) {
                        //TODO handle drain here please
                        let drain = destination.write(
                            createPacket(relativePath, chunk),
                            (err) => {
                                if (err) return reject(err)
                            }
                        )
                        if (!drain) {
                            awaitDrain()
                            console.log(c.red("waiting for draining"))
                            break
                        }
                    }
                }
                readAndSend()
            })
            currentSource.once('error', (err) => {
                console.error(
                    c.red(
                        `error happened while reading file ${currentPath} : ${err.message}`
                    )
                )
                reject(err)
            })
            currentSource.once('end', () => {
                const endOfFileMessage = 'all done'
                console.log(
                    c.bgCyanBright(
                        `sending end of file message for ${relativePath}`
                    )
                )
                let drain = new Promise((res, rej) => {
                    destination.write(
                        createPacket(
                            relativePath,
                            Buffer.from(endOfFileMessage)
                        ),
                        (err) => {
                            if (err) return rej(err)
                            res()
                        }
                    )
                })
                pendingWritingOperations.push(drain)
                if (pendingWritingOperations.length === receivedLengthOfFiles)
                    return awaitPendingWrites()
            })
        }
    })
}
