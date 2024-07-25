import fs from 'fs-extra'
import { config } from './appConfig.js'


export default class DestinationResolver {
  constructor() {
    this.pendingFiles = new Map()
    this.destinationPath = config.getDestinationPath()
    // TODO add the destinationPath here for mocks of the module to work 
  }

  writeToDestination(destinationPath, dataBuffer, callback) {
    let fileStream
    if (this.pendingFiles.has(destinationPath)) {
      fileStream = this.pendingFiles.get(destinationPath)
      fileStream.write(dataBuffer, callback)
    } else {
      this.createFileIfNotExists(destinationPath)
      // The async counterpart here is buggy so I am using the sync version
      //await fs.ensureFile(destinationPath)
      fileStream = fs.createWriteStream(destinationPath)
      this.pendingFiles.set(destinationPath, fileStream)
      fileStream.write(dataBuffer, callback)
    }
  }

  createFileIfNotExists(filePath) {
    return fs.ensureFileSync(filePath)
  }

  createDirectoryIfNotExists(directoryPath, callback) {
    return fs.ensureDir(directoryPath, callback)
  }

  saveToFileSystem(relativePath, dataBuffer, callback) {
    const fullPath = `${this.destinationPath}${relativePath.toString()}`
    const endOfFile = Buffer.from('all done')
    if (dataBuffer === null) return this.createDirectoryIfNotExists(fullPath, callback)
    if (dataBuffer.length === endOfFile.length && dataBuffer.compare(endOfFile) === 0) {
      if (this.pendingFiles.has(fullPath)) {
        let pendingStream = this.pendingFiles.get(fullPath)
        return pendingStream.end(callback)
      } else return callback(new Error('No pending file found'))
    }
    this.writeToDestination(fullPath, dataBuffer, (error) => {
      if (error) {
        this.cleanUp()
        callback(error)
      } else callback(null)
    })
  }
  // This clean up might not be necessary since I always use a new instance of this class
  cleanUp() {
    Array.from(this.pendingFiles).map(value => {
      value[1].end()
    })
    this.pendingFiles.clear()
  }
}

