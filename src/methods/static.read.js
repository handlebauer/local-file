import { readFile } from 'fs/promises'
import { getStats } from './static.getStats.js'
import { LocalFile } from '../LocalFile.js'
import { LocalFileError } from '../errors/LocalFileError.js'

/**
 * @public
 *
 * @typedef {import("../LocalFile.types.js").LocalFileStats} LocalFileStats
 *
 * @param {string} path
 * @param {(data: string) => string | Record<string, any>} decode
 * @param {LocalFileStats} [stats]
 */
export async function read(path, decode, stats) {
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
