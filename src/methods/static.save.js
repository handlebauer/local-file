import { typeOf } from '@hbauer/convenience-functions'
import { isTruthy } from 'remeda'
import { getStats } from './static.getStats.js'
import { LocalFile } from '../LocalFile.js'
import { writeToPath } from '../utils/write-to-path.js'
import { LocalFileError } from '../errors/LocalFileError.js'

/**
 * @public
 *
 * @typedef {import('../LocalFile.types.js').LocalFileAccept} LocalFileAccept
 *
 * @param {string} path
 * @param {LocalFileAccept} data
 * @param {(data: LocalFileAccept) => string} encode
 */
export async function save(path = null, data = null, encode) {
  if (typeof path !== 'string' || path === null) {
    throw new LocalFileError({
      title: 'save',
      description: `found an empty path or a path of an incompatible type (${typeof path})`,
    })
  }

  if (
    data === '' ||
    (typeof data !== 'string' &&
      typeOf(data) !== 'object' &&
      typeOf(data) !== 'array')
  ) {
    throw new LocalFileError({
      title: 'save',
      description: data
        ? `found empty data or data of an incompatible type (${typeOf(data)})`
        : 'found empty data or data of an incompatible type',
    })
  }

  let stats = await getStats(path)

  /**
   * File already exists - return it
   */
  if (stats !== null) {
    return new LocalFile(path, data, stats)
  }

  if (typeof data === 'string') {
    await writeToPath(path, data)
  } else {
    let seralizedData = undefined

    try {
      seralizedData = encode(data)
    } catch (error) {
      throw new LocalFileError({
        title: 'save',
        description: `failed while serializing data`,
        parent: error,
      })
    }

    await writeToPath(path, seralizedData)
  }

  stats = await getStats(path)

  return new LocalFile(path, data, stats)
}
