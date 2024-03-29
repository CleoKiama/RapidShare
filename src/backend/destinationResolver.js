import fs from 'fs-extra'
import c from 'ansi-colors'
import { promisify } from 'util'
import { config } from './appConfig.js'


export default class DestinationResolver {
  constructor() {
    this.pendingFiles = new Map()
    this.destinationPath = config.getDestinationPath()
    // TODO add the destinationPath here for mocks of the module to work 
  }

  async writeToDestination(destinationPath, dataBuffer) {
    let fileStream
    let writeAsync
    if (this.pendingFiles.has(destinationPath)) {
      fileStream = this.pendingFiles.get(destinationPath)
      writeAsync = promisify(fileStream.write).bind(fileStream)
      return await writeAsync(dataBuffer)
    }
    this.createFileIfNotExists(destinationPath)
    //await fs.ensureFile(destinationPath)
    fileStream = fs.createWriteStream(destinationPath)
    writeAsync = promisify(fileStream.write).bind(fileStream)
    this.pendingFiles.set(destinationPath, fileStream)
    await writeAsync(dataBuffer)
  }

  createFileIfNotExists(filePath) {
    return fs.ensureFileSync(filePath)
  }

  createDirectoryIfNotExists(directoryPath) {
    return fs.ensureDir(directoryPath)
  }

  async saveToFileSystem(relativePath, dataBuffer) {
    const fullPath = `${this.destinationPath}${relativePath.toString()}`
    const endOfFile = Buffer.from('all done')
    if (dataBuffer === null)
      return this.createDirectoryIfNotExists(fullPath)
    if (
      dataBuffer.length === endOfFile.length &&
      dataBuffer.compare(endOfFile) === 0
    ) {
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
