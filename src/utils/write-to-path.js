import { mkdir, writeFile } from 'fs/promises'
import { removeSlashes } from '@hbauer/convenience-functions'
import { throwUnlessEEXIST } from '../errors/throw-unless-eexist.js'
import { LocalFileError } from '../errors/LocalFileError.js'

/**
 * @param {string} path
 * @returns
 */
export const parseDirectory = path =>
  path.split('/').slice(0, -1).join('/') || null

/**
 * @param {string} path
 * @param {string} data
 * @returns {Promise<void>}
 */
export const writeToPath = async (path, data) => {
  const normalizedPath = removeSlashes(path)

  if (normalizedPath === null) {
    throw new LocalFileError('writeToPath', {
      message: `invalid path (${path})`,
    })
  }

  try {
    const directory = parseDirectory(normalizedPath)

    if (directory) {
      await mkdir(directory, { recursive: true }).catch(throwUnlessEEXIST)
    }

    await writeFile(normalizedPath, data)
  } catch (error) {
    throw new LocalFileError('writeToPath', {
      message: `Failed to write ${normalizedPath} to file`,
      parent: error,
    })
  }
}
