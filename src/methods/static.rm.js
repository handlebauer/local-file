import { rm as remove } from 'fs/promises'
import * as validate from '../parameters/common.js'
import { LocalFileError } from '../errors/LocalFileError.js'

/**
 * @typedef {import('./static.getStats.js').LocalFilePath} LocalFilePath
 */

/**
 * @public
 *
 * @param {LocalFilePath} path
 * @returns {Promise<void>}
 */
export async function rm(path) {
  path = validate.filePath.parse(path)

  try {
    await remove(path)
  } catch (error) {
    throw new LocalFileError('rm', {
      message: `failed while removing data`,
      parent: error,
    })
  }
}
