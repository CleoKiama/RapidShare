/**
 * @jest-environment node
 */
import updateUi from '../backend/updateUi.js'
import TransferProgress from '../backend/transferProgress.js'
import Demultiplexer from '../backend/demultiplexer.js'
import path from 'node:path'
import formatBytes from '../backend/formatBytes.js'
import fastFolderSize from 'fast-folder-size'
import os from 'node:os'
import fs from 'fs-extra'
import { promisify } from 'node:util'
import { PassThrough } from 'node:stream'
import multiplexer from '../backend/multiplexer.js'
import GetFilesSize from '../backend/readFilesSize.js'

var updateUiSpy = jest.spyOn(updateUi, 'updateProgress').mockImplementation(() => { })

var setProgressSpy = jest.spyOn(TransferProgress, 'setProgress')

var sourcePath = `${os.tmpdir()}/send`
var destinationPath = `${os.tmpdir()}/username/Downloads`


jest.mock("../backend/appConfig.js", () => {
  const os = require("node:os")
  var path = `${os.tmpdir()}/username/Downloads`
  return {
    __esModule: true,
    config: {
      getDestinationPath: () => path
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
})
beforeEach(() => {
  fs.ensureDirSync(sourcePath)
  let values = Object.values(json)
  Object.keys(json).map((value, index) => {
    fs.ensureFileSync(`${sourcePath}/${value}`)
    fs.writeFileSync(`${sourcePath}/${value}`, values[index])
  })
})

const getSize = async (rootPath) => {
  if (!path.extname(rootPath)) {
    const fastFolderSizeAsync = promisify(fastFolderSize)
    let size = await fastFolderSizeAsync(rootPath)
    return formatBytes(size)
  }
  let { size } = await fs.stat(rootPath)
  return formatBytes(size)
}


test("mux and demux work and update the progress", async () => {
  let sourceSize = await getSize(sourcePath)
  let transferInterface = new PassThrough()
  let demux = Demultiplexer(transferInterface)
  let totalSize = await GetFilesSize(sourcePath)
  TransferProgress.setTotalSize(totalSize)
  await multiplexer(sourcePath, transferInterface)
  transferInterface.end()
  await demux
  let finalsize = await getSize(destinationPath)
  expect(finalsize).toBe(sourceSize)
  expect(updateUiSpy).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
})


describe("Updates the progress even for empty directories or files", () => {
  let emptyDirSource = `${os.tmpdir()}/emptyDirTest`
  beforeEach(() => {
    fs.removeSync(emptyDirSource)
    fs.removeSync((destinationPath))
    fs.ensureDirSync(emptyDirSource)
  })
  it("updates the progress for empty dirs", async () => {
    let initSize = await getSize(emptyDirSource)
    expect(initSize).toBe('0 Bytes')
    let transferInterface = new PassThrough()
    let demux = Demultiplexer(transferInterface)
    let sizeRead = await GetFilesSize(emptyDirSource)
    TransferProgress.updateTotalSize(sizeRead)
    await multiplexer(emptyDirSource, transferInterface)
    transferInterface.end()
    await demux
    let finalsize = await getSize(`${destinationPath}/emptyDirTest`)
    expect(finalsize).toBe(initSize)
    expect(updateUiSpy).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
    expect(setProgressSpy).toHaveBeenCalledWith(0)
    expect(setProgressSpy).toHaveReturnedWith(100)
  })
})

