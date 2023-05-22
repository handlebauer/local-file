import { readFile } from 'fs/promises'
import { getStats } from './static.getStats.js'
import * as validate from '../parameters/common.js'
import { LocalFile } from '../LocalFile.js'
import { LocalFileError } from '../errors/LocalFileError.js'

/**
 * @typedef {import('../parameters/common.js').LocalFileAccepts} LocalFileAccepts
 *
 * @param {string} path
 * @param {(rawData: string) => LocalFileAccepts} decode
 */
const validateParams = (path, decode) => {
  const validatedPath = validate.filePath.safeParse(path)
  const validatedDecode = validate.decodeFunction.safeParse(decode)

  if (validatedPath.success === false) {
    throw new LocalFileError({
      title: 'save[path parameter]',
      description: validatedPath.error.message,
    })
  }

  if (validatedDecode.success === false) {
    throw new LocalFileError({
      title: 'save[decode parameter]',
      description: validatedDecode.error.message,
    })
  }

  return { path: validatedPath.data, decode: validatedDecode.data }
}

/**
 * @public
 *
 * @typedef {import('../parameters/common.js').LocalFilePath} LocalFilePath
 * @typedef {import('../parameters/common.js').LocalFileEDecodeFunction} LocalFileEDecodeFunction
 * @typedef {import("../LocalFile.types.js").LocalFileStats} LocalFileStats
 *
 * @param {LocalFilePath} path
 * @param {LocalFileEDecodeFunction} decode
 * @param {LocalFileStats} [stats]
 * @returns {Promise<LocalFile>}
 */
export async function read(path, decode, stats) {
  ;({ path, decode } = validateParams(path, decode))

  stats = stats || (await getStats(path))

  if (stats === null) {
    throw new LocalFileError({
      title: 'read',
      description: `path to file (${path}) does not exist`,
    })
  }

  let data = undefined

  try {
    data = await readFile(path, 'utf-8').then(decode)
  } catch (error) {
    throw new LocalFileError({
      title: 'read',
      description: `failed while reading/decoding file (${path})`,
      parent: error,
    })
  }

  return new LocalFile(path, data, stats)
}
