import TransferProgress from '../backend/transferProgress.js'
import fs from 'fs-extra'
import multiplexer from '../backend/multiplexer.js'
import { PassThrough } from 'node:stream'
import path from 'node:path'
import os from "node:os"

jest.mock("../backend/updateUi.js", () => {
  return {
    __esModule: true,
    default: {
      updateProgress: jest.fn()
    }
  }
})

/**
 * Root path for test files.
 */
const rootPath = `${os.tmpdir()}/RapidShareMultiplexer_test`

/**
 * Test files and their content.
 */
const testFiles = {
  'fileOne.txt': 'The quick brown fox jumps over the lazy dog.',
  'fileTwo.txt': 'A journey of a thousand miles begins with a single step.',
  'fileThree.txt': 'Actions speak louder than words.',
  'dirOne/fileFour.txt': "Life is what happens when you're busy making other plans.",
  'dirOne/fileFive.txt': 'Every cloud has a silver lining.',
  'dirOne/dirTwo/fileSix.txt': "Where there's a will, there's a way.",
  'dirTwo/fileSeven.txt': 'The only limit to our realization of tomorrow will be our doubts of today.'
}

/**
 * Helper function to set up test files.
 * @param {string} rootPath - The root path for the test files.
 * @param {Object} files - An object containing file paths and their content.
 */
async function setupTestFiles(rootPath, files) {
  await fs.emptyDir(rootPath) // Clear any existing test data
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(rootPath, filePath)
    await fs.ensureFile(fullPath)
    await fs.writeFile(fullPath, content)
  }
}

test('multiplexes multiple streams', async () => {
  const controller = new AbortController()

  const ownRootPath = `${rootPath}/one`
  await setupTestFiles(ownRootPath, testFiles)

  const returnedPaths = []
  const returnedData = []
  const destination = new PassThrough()
  let currentLength = null

  const dataPromise = new Promise((resolve) => {
    destination.on('readable', function() {
      while (true) {
        let chunk
        if (currentLength === null) {
          chunk = destination.read(4)
          if (chunk === null) break
          currentLength = chunk.readUInt32BE(0)
        }

        chunk = destination.read(currentLength)
        if (chunk === null) break

        const progress = chunk.readUInt8(0)
        const pathLength = chunk.readUInt8(1)
        const currentPath = chunk.toString('utf8', 2, 2 + pathLength)
        const data = chunk.toString('utf8', 2 + pathLength, chunk.length)

        if (data !== 'all done') {
          returnedData.push(data)
          returnedPaths.push(currentPath)
        }
        currentLength = null
      }
    })

    destination.on('end', resolve)
  })

  try {
    await multiplexer(ownRootPath, destination, controller)
    destination.end()
    await dataPromise
  } catch (error) {
    console.error('Error during multiplexing:', error)
    throw error // Fail the test if an error occurs
  }

  // Cleanup test directory
  await fs.remove(ownRootPath)

  // Prepare expected data
  const expectedPaths = Object.keys(testFiles).map(filePath =>
    `/${path.basename(ownRootPath)}/${filePath}`
  )
  const expectedData = Object.values(testFiles)

  // Assertions
  expect(returnedData).toHaveLength(expectedData.length, 'Returned data length mismatch')
  expect(returnedData).toEqual(expect.arrayContaining(expectedData), 'Returned data content mismatch')
  expect(returnedPaths).toHaveLength(expectedPaths.length, 'Returned paths length mismatch')
  expect(returnedPaths).toEqual(expect.arrayContaining(expectedPaths), 'Returned paths content mismatch')
})

test('it handles empty directories', async () => {
  const controller = new AbortController();
  const ownRootPath = `${rootPath}/two`
  const emptyDirData = ["emptyDirOne", "emptyDirTwo", "emptyDirThree", "emptyDirOne/emptyDirFour"];

  // Create empty directories
  for (const dirPath of emptyDirData) {
    await fs.ensureDir(path.resolve(ownRootPath, dirPath));
  }

  const returnedEmptyDirs = [];
  const destination = new PassThrough();
  let currentLength = null;

  const dataPromise = new Promise((resolve) => {
    destination.on('readable', function() {
      while (true) {
        let chunk;
        if (currentLength === null) {
          chunk = destination.read(4);
          if (chunk === null) break;
          currentLength = chunk.readUInt32BE(0);
        }

        chunk = destination.read(currentLength);
        if (chunk === null) break;

        const pathLength = chunk.readUInt8(1);
        const currentPath = chunk.toString('utf8', 2, 2 + pathLength);
        returnedEmptyDirs.push(currentPath);
        currentLength = null;
      }
    });

    destination.on('end', () => {
      resolve();
    });
  });

  try {
    await multiplexer(ownRootPath, destination, controller);
    destination.end();
    await dataPromise;
  } catch (error) {
    console.error('Error during multiplexing:', error);
  }

  const expectedRelativePaths = emptyDirData.map(dirPath => `/${path.basename(ownRootPath)}/${dirPath}`)
  expectedRelativePaths.push(`/${path.basename(ownRootPath)}`)
  expect(returnedEmptyDirs.length).toBe(expectedRelativePaths.length)
  expect(returnedEmptyDirs).toEqual(expect.arrayContaining(expectedRelativePaths));
});

