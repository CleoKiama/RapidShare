import * as memfs from 'memfs'
import { setTimeout as setTimeoutPromise } from 'timers/promises'
import TransferProgress from '../backend/transferProgress.js'

jest.mock('fs/promises', () => memfs.promises)
jest.mock('fs', () => memfs)
import multiplexer from '../backend/multiplexer.js'
import { PassThrough } from 'stream'
import path from 'path'

jest.spyOn(TransferProgress, "updateUi").mockImplementation(() => {
})
jest.spyOn(TransferProgress, "setProgress").mockImplementation(() => {
  TransferProgress.updateUi(40, 140)
  return 40
})
const json = {
  './fileOne.txt':
    'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.',
  './fileTwo.txt': 'A journey of a thousand miles begins with a single step.',
  './fileThree.txt': 'Actions speak louder than words.',
  './dirOne/fileFour.txt':
    "Life is what happens when you're busy making other plans.",
  './dirOne/fileFive.txt': 'Every cloud has a silver lining.',
  './dirOne/dirTwo/fileSix.txt': "Where there's a will, there's a way.",
  './dirOne/dirTwo/fileSeven.txt':
    'The only limit to our realization of tomorrow will be our doubts of today.',
  './dirOne/dirTwo/dirThree/fileEight.txt':
    "It always seems impossible until it's done.",
  './dirOne/dirTwo/dirThree/fileNine.txt':
    "Don't count the days, make the days count.",
  './dirTwo/fileTen.txt':
    'The only impossible journey is the one you never begin.',
  './dirTwo/fileEleven.txt': "Believe you can and you're halfway there.",
  './dirTwo/dirFour/fileTwelve.txt':
    'Life is either a daring adventure or nothing at all.',
  './dirTwo/dirFour/fileThirteen.txt':
    'You have within you right now, everything you need to deal with whatever the world can throw at you.',
  './dirTwo/dirFour/dirFive/fileFourteen.txt':
    'The best way to predict the future is to create it.',
  './dirTwo/dirFour/dirFive/fileFifteen.txt':
    'The only limit to our realization of tomorrow will be our doubts of today.',
}

beforeEach(() => {
  memfs.vol.reset()
})

test('multiplexes multiple streams', async () => {
  const rootPath = '/app/root'
  memfs.vol.fromJSON(json, rootPath)
  const pathToFiles = '/app/root'
  const paths = Object.keys(json)
  const expectedData = Object.values(json)
  const expectedPaths = paths.map(
    (value) => `/${path.basename(rootPath)}${value.substring(1)}`
  )
  const destination = new PassThrough()
  var currentLength = null
  var currentPath = null
  var returnedPaths = []
  var returnedData = []
  destination.on('readable', function() {
    let chunk
    if (currentLength === null) {
      chunk = destination.read(4)
      currentLength = chunk && chunk.readUInt32BE(0)
    }
    if (currentLength === null) {
      return null
    }
    chunk = destination.read(currentLength)
    if (chunk === null) {
      return null
    }
    let progress = chunk.readUInt8(0)
    let pathLength = chunk.readUInt8(1)
    currentPath = chunk.toString('utf8', 2, 2 + pathLength)
    const returnedChunk = chunk.toString(
      'utf8',
      2 + pathLength,
      chunk.length
    )
    if (returnedChunk !== 'all done') {
      returnedData.push(returnedChunk)
      returnedPaths.push(currentPath)
    }
    currentLength = null
    currentPath = null
  })
  try {
    TransferProgress.setTotalSize(400)
    await multiplexer(pathToFiles, destination)
  } catch (error) {
    console.error(error)
  }

  expect(returnedData).toEqual(expect.arrayContaining(expectedData))
  expect(returnedData).toHaveLength(expectedData.length)
  expect(returnedPaths).toHaveLength(expectedPaths.length)
  expect(returnedPaths).toEqual(expect.arrayContaining(expectedPaths))
})

test('it handles empty directories', async () => {
  memfs.vol.mkdirSync('/app')
  memfs.vol.mkdirSync('/app/root/')
  memfs.vol.mkdirSync('/app/root/emptyDirOne')
  memfs.vol.mkdirSync('/app/root/emptyDirTwo')
  memfs.vol.mkdirSync('/app/root/emptyDirTwo/emptyDirThree')
  memfs.vol.mkdirSync('/app/root/emptyDirTwo/emptyDirFour')
  memfs.vol.mkdirSync('/app/root/emptyDirOne/emptyDirFive')
  memfs.vol.mkdirSync(
    '/app/root/emptyDirOne/emptyDirFive/nestedDirEmptyDirSix'
  )
  const returnedEmptyDirs = []
  const rootPath = '/app/root'
  const destination = new PassThrough()
  let currentLength = null
  let currentPath = null
  destination
    .on('readable', function() {
      let chunk
      if (currentLength === null) {
        chunk = destination.read(4)
        currentLength = chunk && chunk.readUInt32BE(0)
      }
      if (currentLength === null) {
        return null
      }

      chunk = destination.read(currentLength)
      if (chunk.length === null) {
        return null
      }
      let progress = chunk.readUInt8(0)
      let pathLength = chunk.readUInt8(1)
      currentPath = chunk.toString('utf8', 2, 2 + pathLength)
      const bufferContent = chunk.toString(
        'utf8',
        2 + pathLength,
        chunk.length
      )
      expect(bufferContent).toHaveLength(0)
      returnedEmptyDirs.push(currentPath)
      currentPath = null
      currentLength = null
    })
    .on('error', (error) => {
      console.error(`error in the destination stream ${error.message}`)
    })
  try {
    await multiplexer(rootPath, destination).catch((error) => {
      throw new Error(error.message)
    })
  } catch (error) {
    console.error(error)
  }
  await setTimeoutPromise(200)
  let expectedDirs = [
    '/root',
    '/root/emptyDirOne',
    '/root/emptyDirTwo',
    '/root/emptyDirOne/emptyDirFive',
    '/root/emptyDirTwo/emptyDirFour',
    '/root/emptyDirTwo/emptyDirThree',
    '/root/emptyDirOne/emptyDirFive/nestedDirEmptyDirSix',
  ]
  expect(returnedEmptyDirs).toEqual(expectedDirs)
})
