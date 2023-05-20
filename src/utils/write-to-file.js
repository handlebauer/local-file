import { mkdir, writeFile } from 'fs/promises'
import { removeSlashes } from '@hbauer/convenience-functions'
import { throwUnlessEEXIST } from './throw-unless-eexist.js'

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
export const writeToFile = async (path, data) => {
  path = removeSlashes(path) ?? null

  if (path === null) {
    throw new Error(`LocalCache: writeToFile error: invalid path (${path}) `)
  }

  try {
    const directory = parseDirectory(path)
    await mkdir(directory, { recursive: true }).catch(throwUnlessEEXIST)
    await writeFile(path, data)
  } catch (error) {
    console.log('writeToFileError')
    throw new Error(error)
  }
}
