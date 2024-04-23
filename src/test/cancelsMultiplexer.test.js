/**
 * @jest-environment node
 */
import updateUi from '../backend/updateUi.js'
import TransferProgress from '../backend/transferProgress.js'
import Demultiplexer from '../backend/demultiplexer.js'
import os from 'node:os'
import fs from 'fs-extra'
import { PassThrough } from 'node:stream'
import multiplexer, { cancelOperation } from '../backend/multiplexer.js'
import GetFilesSize from '../backend/readFilesSize.js'
import c from 'ansi-colors'

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
  let transferInterface = new PassThrough()
  let demux = Demultiplexer(transferInterface)
  let totalSize = await GetFilesSize(sourcePath)
  TransferProgress.setTotalSize(totalSize)
  setImmediate(() => {
    cancelOperation()
  }, 200)
  await new Promise((done) => {
    multiplexer(sourcePath, transferInterface).catch(error => {
      expect(error.code).toBe('ABORT_ERR')
      transferInterface.end()
      done()
    })
  })
  await demux
})


describe('cancels for empty directories', () => {
  beforeEach(() => {
    fs.removeSync(sourcePath)
    fs.removeSync((destinationPath))
    fs.ensureDirSync(sourcePath)
  })

  it("cancels multiplexer for empty directories", async () => {
    let transferInterface = new PassThrough()
    let demux = Demultiplexer(transferInterface)
    let totalSize = await GetFilesSize(sourcePath)
    TransferProgress.setTotalSize(totalSize)
    setImmediate(() => {
      cancelOperation()
    }, 200)
    await new Promise((done) => {
      multiplexer(sourcePath, transferInterface).catch(error => {
        transferInterface.end()
        expect(error.code).toBe('ABORT_ERR')
        done()
      })
    })
    await demux
  })
})


test("Demux cleans up and rejects on abort", async () => {
  let transferInterface = new PassThrough()
  let demux = Demultiplexer(transferInterface)
  let totalSize = await GetFilesSize(sourcePath)
  TransferProgress.setTotalSize(totalSize)
  setImmediate(() => {
    cancelOperation()
  }, 200)
  multiplexer(sourcePath, transferInterface).catch((error) => {
    //rememeber to call destry in transferInterface
    transferInterface.destroy(error)
  })
  const errorSpy = jest.fn((error) => {
    expect(error.code).toBe("ABORT_ERR")
  })
  transferInterface.on('error', errorSpy)
  await new Promise(done => {
    demux.catch(() => {
      done()
    })
  })
  expect(errorSpy).toHaveBeenCalled()
})


