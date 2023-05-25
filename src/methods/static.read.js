import { readFile } from 'fs/promises'
import { getStats } from './static.getStats.js'
import * as validate from '../parameters/common.js'
import { LocalFile } from '../LocalFile.js'
import { LocalFileError } from '../errors/LocalFileError.js'

/**
 * @typedef {import('../LocalFile.types.js').LocalFileData} LocalFileData
 *
 * @param {string} path
 * @param {(rawData: string) => LocalFileData} decode
 */
const validateParams = (path, decode) => {
  const validatedPath = validate.filePath.safeParse(path)
  const validatedDecode = validate.decodeFunction.safeParse(decode)

  if (validatedPath.success === false) {
    throw new LocalFileError('save[path parameter]', {
      message: validatedPath.error.message,
    })
  }

  if (validatedDecode.success === false) {
    throw new LocalFileError('save[decode parameter]', {
      message: validatedDecode.error.message,
    })
  }

  return { path: validatedPath.data, decode: validatedDecode.data }
}

/**
 * @typedef {import('../parameters/common.js').LocalFilePath} LocalFilePath
 * @typedef {import('../parameters/common.js').LocalFileEDecodeFunction} LocalFileEDecodeFunction
 * @typedef {import("../LocalFile.types.js").LocalFileStats} LocalFileStats
 */

/**
 * @public
 *
 * @param {LocalFilePath} path
 * @param {LocalFileEDecodeFunction} decode
 * @param {LocalFileStats} [stats]
 * @returns {Promise<LocalFile<any>>}
 */
export async function read(path, decode, stats) {
  ;({ path, decode } = validateParams(path, decode))

  stats = stats || (await getStats(path))

  let data = undefined

  try {
    data = await readFile(path, 'utf-8').then(decode)
  } catch (error) {
    throw new LocalFileError('read', {
      message: `failed while reading/decoding file (${path})`,
      parent: error,
    })
  }

  return new LocalFile(path, data, stats)
}
