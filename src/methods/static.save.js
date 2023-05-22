import * as validate from '../parameters/common.js'
import { LocalFile } from '../LocalFile.js'
import { writeToPath } from '../utils/write-to-path.js'
import { LocalFileError } from '../errors/LocalFileError.js'
import { throwUnlessENOENT } from '../errors/throw-unless-enoent.js'

/**
 * @param {string} path
 * @param {LocalFileAccepts} data
 * @param {(data: LocalFileAccepts) => string} encode
 */
const validateParams = (path, data, encode) => {
  const validatedPath = validate.filePath.safeParse(path)
  const validatedData = validate.fileAccepts.safeParse(data)
  const validatedEncode = validate.encodeFunction.safeParse(encode)

  if (validatedPath.success === false) {
    throw new LocalFileError({
      title: 'save[path parameter]',
      description: validatedPath.error.message,
    })
  }

  if (validatedData.success === false) {
    throw new LocalFileError({
      title: 'save[data parameter]',
      description: validatedData.error.message,
    })
  }

  if (validatedEncode.success === false) {
    throw new LocalFileError({
      title: 'save[encode parameter]',
      description: validatedEncode.error.message,
    })
  }

  return {
    path: validatedPath.data,
    data: validatedData.data,
    encode: validatedEncode.data,
  }
}

/**
 * @public
 *
 * @typedef {import('../parameters/common.js').LocalFileAccepts} LocalFileAccepts
 *
 * @param {string} path
 * @param {LocalFileAccepts} data
 * @param {(data: LocalFileAccepts) => string} [encode]
 * @param {{ returnExisting?: boolean }} [options]
 * @returns {Promise<LocalFile>}
 */
export async function save(path, data, encode, options = {}) {
  ;({ path, data, encode } = validateParams(path, data, encode))

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
      throw new LocalFileError({
        title: 'save',
        description: `failed while serializing/writing data`,
        parent: error,
      })
    }
  }

  stats = await LocalFile.getStats(path)

  return new LocalFile(path, data, stats)
}
