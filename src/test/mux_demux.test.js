/**
 * @jest-environment node
 */
import fastFolderSize from 'fast-folder-size'
import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import { PassThrough } from 'node:stream'
import { setTimeout } from 'node:timers/promises'
import { promisify } from 'node:util'
import Demultiplexer from '../backend/demultiplexer.js'
import formatBytes from '../backend/formatBytes.js'
import multiplexer from '../backend/multiplexer.js'
import GetFilesSize from '../backend/readFilesSize.js'
import TransferProgress from '../backend/transferProgress.js'
import updateUi from '../backend/updateUi.js'

const updateUiSpy = jest.spyOn(updateUi, 'updateProgress').mockImplementation(() => { })

const setProgressSpy = jest.spyOn(TransferProgress, 'setProgress')

const sourcePath = `${os.tmpdir()}/Home`
const destinationPath = `${os.tmpdir()}/me/Downloads`


jest.mock("../backend/appConfig.js", () => {
  const os = require("node:os")
  const destinationPath = `${os.tmpdir()}/me/Downloads`
  return {
    __esModule: true,
    config: {
      getDestinationPath: () => destinationPath
    }
  }
})


const json = {
  "/dirOne/fileOne.txt": "file one text content",
  "/fileFive.txt": "content of file five.txt",
  "/fileSix.txt": "content of file six.txt here",
  "/dirOne/dirTwo/fileFour.txt": "content of file four.txt",
  "/dirOne/dirTwo/fileTwo.txt": "content of file two.txt",
  "/dirOne/dirTwo/fileThree.txt": "content of file three.txt",
  "/dirOne/dirTwo/fileEmpty.txt": "hello yeah",
  "/dirOne/dirTwo/dirThree/fileSeven.txt": "content of file seven.txt",
  "/dirOne/dirTwo/dirThree/fileEight.txt": "content of file eight.txt",
  "/dirOne/dirTwo/dirThree/fileNine.txt": "content of file nine.txt",
  "/dirOne/dirTwo/dirThree/fileTen.txt": "content of file ten.txt",
  "/dirOne/dirTwo/dirThree/fileEleven.txt": "content of file eleven.txt",
};

beforeEach(() => {
  fs.removeSync(sourcePath)
  fs.removeSync((destinationPath))
  fs.ensureDirSync(sourcePath)
  const values = Object.values(json)
  Object.keys(json).map((value, index) => {
    fs.ensureFileSync(`${sourcePath}/${value}`)
    fs.writeFileSync(`${sourcePath}/${value}`, values[index])
  })

})

const getSize = async (rootPath) => {
  try {
    if (!path.extname(rootPath)) {
      const fastFolderSizeAsync = promisify(fastFolderSize)
      const size = await fastFolderSizeAsync(rootPath)
      return formatBytes(size)
    }
    const { size } = await fs.stat(rootPath)
    return formatBytes(size)

  } catch (error) {
    console.error(`error reading${rootPath}`)
    console.error(error.message)
  }
}


// This currently fails but a manual test shows that the mux and demux works will fix this later
test("mux and demux work and update the progress", async () => {
  const controller = new AbortController()
  const sourceSize = await getSize(sourcePath)
  const transferInterface = new PassThrough()
  const demuxerCallback = jest.fn()
  Demultiplexer(transferInterface, demuxerCallback)
  const totalSize = await GetFilesSize(sourcePath)
  TransferProgress.setTotalSize(totalSize)
  await multiplexer(sourcePath, transferInterface, controller)
  transferInterface.end()
  // await for the callback to be called 
  await setTimeout(500)
  expect(demuxerCallback).toHaveBeenCalled()
  const finalsize = await getSize(destinationPath)
  expect(updateUiSpy).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
  expect(finalsize).toBe(sourceSize)
})


describe("Updates the progress for empty directories or files", () => {
  const controller = new AbortController()
  const emptyDirSource = `${os.tmpdir()}/emptyDirTest`
  beforeEach(() => {
    fs.removeSync(emptyDirSource)
    fs.ensureDirSync(emptyDirSource)
    fs.ensureDirSync((`${destinationPath}`))
  })
  it("updates the progress for empty dirs", async () => {
    const initSize = await getSize(emptyDirSource)
    expect(initSize).toBe('0 Bytes')
    const transferInterface = new PassThrough()
    const demuxerCallback = jest.fn()
    Demultiplexer(transferInterface, demuxerCallback)
    const sizeRead = await GetFilesSize(emptyDirSource)
    TransferProgress.updateTotalSize(sizeRead)
    await multiplexer(emptyDirSource, transferInterface, controller)
    transferInterface.end()
    const finalSize = await getSize(`${destinationPath}/emptyDirTest`)
    expect(finalSize).toBe(initSize)
    expect(updateUiSpy).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
    expect(setProgressSpy).toHaveBeenCalledWith(0)
    expect(setProgressSpy).toHaveReturnedWith(100)
    expect(demuxerCallback).toHaveBeenCalled()
  })
})

