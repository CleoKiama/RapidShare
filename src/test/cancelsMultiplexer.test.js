/**
 * @jest-environment node
 */
import updateUi from '../backend/updateUi.js'
import TransferProgress from '../backend/transferProgress.js'
import Demultiplexer from '../backend/demultiplexer.js'
import os from 'node:os'
import fs from 'fs-extra'
import { PassThrough } from 'node:stream'
import multiplexer from '../backend/multiplexer.js'
import GetFilesSize from '../backend/readFilesSize.js'
import { setTimeout as timeoutPromise } from 'node:timers/promises'

jest.spyOn(updateUi, 'updateProgress').mockImplementation(() => { })

jest.spyOn(TransferProgress, 'setProgress')

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
  fs.ensureDirSync(sourcePath)
  let values = Object.values(json)
  Object.keys(json).map((value, index) => {
    fs.ensureFileSync(`${sourcePath}/${value}`)
    fs.writeFileSync(`${sourcePath}/${value}`, values[index])
  })
})


test("cancels multiplexer when aborted", async () => {
  const controller = new AbortController()
  expect.assertions(1); // Ensure that one assertion is called
  let transferInterface = new PassThrough()
  Demultiplexer(transferInterface, (error) => {
    if (error) {
      console.error(error.message)
    }
  })
  const totalSize = await GetFilesSize(sourcePath)
  TransferProgress.setTotalSize(totalSize)
  setImmediate(() => {
    controller.abort()
  }, 200)
  await expect(multiplexer(sourcePath, transferInterface, controller)).rejects.toThrow()
})


describe('cancels for empty directories', () => {
  let sourcePath = "/tmp/homepc"
  let destinationPath = "/tmp/userme/Downloads"
  beforeEach(() => {
    fs.removeSync(sourcePath)
    fs.removeSync((destinationPath))
    fs.ensureDirSync(sourcePath)
  })

  it("cancels multiplexer for empty directories", async () => {
    const controller = new AbortController()
    let transferInterface = new PassThrough()
    Demultiplexer(transferInterface, (error) => {
      if (error) {
        console.error(error.message)
      }
    })
    let totalSize = await GetFilesSize(sourcePath)
    TransferProgress.setTotalSize(totalSize)
    setImmediate(() => {
      controller.abort()
    }, 200)
    await expect(multiplexer(sourcePath, transferInterface)).rejects.toThrow()
  })
})

describe('demuxer', () => {
  let sourcePath = "/tmp/pc"
  let destinationPath = "/tmp/userme/Downloads"
  beforeEach(() => {
    fs.removeSync(sourcePath)
    fs.removeSync((destinationPath))
    fs.ensureDirSync(sourcePath)
  })
  test("cleans up and rejects on abort", async () => {
    const controller = new AbortController()
    let transferInterface = new PassThrough()
    const demuxerCallback = jest.fn()
    Demultiplexer(transferInterface, demuxerCallback)
    let totalSize = await GetFilesSize(sourcePath)
    TransferProgress.setTotalSize(totalSize)
    setImmediate(() => {
      controller.abort()
    })
    try {
      await multiplexer(sourcePath, transferInterface)
    } catch (error) {
      //The transferInterface destroys the connection 
      transferInterface.destroy(error)
    }
    await timeoutPromise(1000)
    expect(demuxerCallback).toHaveBeenCalled()
  })

})





