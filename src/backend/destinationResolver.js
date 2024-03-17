import fs   from 'fs-extra'
import c from 'ansi-colors'
import { promisify } from 'util'
import { config } from './appConfig.js'

const destinationPath = config.getDestinationPath()

export default class DestinationResolver {
    constructor() {
        this.pendingFiles = new Map()
    }

    async writeToDestination(destinationPath, dataBuffer) {
        let fileStream
        let writeAsync
        if (this.pendingFiles.has(destinationPath)) {
            fileStream = this.pendingFiles.get(destinationPath)
            writeAsync = promisify(fileStream.write).bind(fileStream)
            return await writeAsync(dataBuffer)
        }
        console.log(
            c.blueBright(`Ensuring the file exists for path ${destinationPath}`)
        )
        //this.createFileIfNotExists(destinationPath)
        await fs.ensureFile(destinationPath)
        fileStream = fs.createWriteStream(destinationPath)
        writeAsync = promisify(fileStream.write).bind(fileStream)
        this.pendingFiles.set(destinationPath, fileStream)
        console.log(c.yellow("about to write some data for newly created  file"))
        await writeAsync(dataBuffer)
        console.log("data for the newly created file written successfully resolving now")
    }

    createFileIfNotExists(filePath) {
        return fs.ensureFileSync(filePath)
    }

    createDirectoryIfNotExists(directoryPath) {
        console.log(c.red("Creating directory (if it doesn't exist)"))
        return fs.ensureDir(directoryPath)
    }

    async saveToFileSystem(relativePath, dataBuffer) {
        const fullPath = `${destinationPath}${relativePath.toString()}`
        const endOfFile = Buffer.from('all done')
        if (dataBuffer === null)
            return this.createDirectoryIfNotExists(fullPath)
        if (
            dataBuffer.length === endOfFile.length &&
            dataBuffer.compare(endOfFile) === 0
        ) {
            console.log(
                c.green(
                    `received all done message from ${fullPath} ending the writable now`
                )
            )
            if (this.pendingFiles.has(fullPath)) {
                let pendingStream = this.pendingFiles.get(fullPath)
                return pendingStream.end()
            } else
                console.error(
                    c.red(`the file is not in the pending streams list: ${relativePath}`)
                )
            return Promise.reject(
                new Error(
                    'all done message received for file not in pending streams list'
                )
            )
        }
        await this.writeToDestination(fullPath, dataBuffer)
    }
}
