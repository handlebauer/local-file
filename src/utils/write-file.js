import { mkdir, writeFile } from 'fs/promises'
import { removeSlashes } from '@hbauer/convenience-functions'
import { throwUnlessEEXIST } from './throw-unless-eexist.js'

/**
 * @param {string} path
 * @param {string} data
 * @returns {Promise<void>}
 */
export const writeToFile = async (path, data) => {
  try {
    const directory = removeSlashes(path).split('/').slice(0, -1).join('/')
    await mkdir(directory).catch(throwUnlessEEXIST)
    await writeFile(path, data)
  } catch (error) {
    throw new Error(error)
  }
}
