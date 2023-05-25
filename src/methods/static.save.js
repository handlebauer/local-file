import * as validate from '../parameters/common.js'
import { LocalFile } from '../LocalFile.js'
import { writeToPath } from '../utils/write-to-path.js'
import { LocalFileError } from '../errors/LocalFileError.js'
import { throwUnlessENOENT } from '../errors/throw-unless-enoent.js'

/**
 * @typedef {import('./static.getStats.js').LocalFilePath} LocalFilePath
 * @typedef {import('../LocalFile.types.js').LocalFileData} LocalFileData
 * @typedef {import('../LocalFile.types.js').LocalFileAccepts} LocalFileAccepts
 */

/**
 * @public
 *
 * @template {LocalFileAccepts} D
 *
 * @param {LocalFilePath} path
 * @param {D} data
 * @param {(data: LocalFileAccepts) => string} [encode]
 * @param {{ returnExisting?: boolean }} [options]
 * @returns {Promise<LocalFile<D>>}
 */
export async function save(path, data, encode, options = {}) {
  path = validate.filePath.parse(path)
  data = validate.accepts.parse(data)
  encode = validate.encodeFunction.parse(encode)

  let stats = await LocalFile.getStats(path).catch(throwUnlessENOENT)

  if (options.returnExisting === true && stats !== null) {
    return new LocalFile(path, data, stats)
  }

  if (typeof data === 'string') {
    await writeToPath(path, data)
  } else {
    try {
      await writeToPath(path, encode(data))
    } catch (error) {
      throw new LocalFileError('save', {
        message: `failed while serializing/writing data`,
        parent: error,
      })
    }
  }

  stats = await LocalFile.getStats(path)

  return new LocalFile(path, data, stats)
}
