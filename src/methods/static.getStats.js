import { stat } from 'fs/promises'
import * as validate from '../parameters/common.js'
import { LocalFileError } from '../errors/LocalFileError.js'

/**
 * @param {LocalFilePath} path
 */
const validateParams = path => {
  const validatedPath = validate.filePath.safeParse(path)

  if (validatedPath.success === false) {
    throw new LocalFileError({
      title: 'getStats[path parameter]',
      description: validatedPath.error,
    })
  }

  return { path: validatedPath.data }
}

/**
 * Returns file statistics if and only if the file exists
 *
 * @typedef {import("../LocalFile.types.js").LocalFileStats} LocalFileStats
 * @typedef {import('../parameters/common.js').LocalFilePath} LocalFilePath
 *
 * @public
 * @param {LocalFilePath} path
 * @returns {Promise<LocalFileStats>}
 */
export async function getStats(path) {
  ;({ path } = validateParams(path))

  let stats = undefined

  try {
    stats = await stat(path)
  } catch (error) {
    throw new LocalFileError({
      title: 'getStats',
      description: `path to file (${path}) does not exist`,
      parent: error,
    })
  }

  return {
    size: {
      bytes: stats.size,
      kilobytes: stats.size / 1e3,
      megabytes: stats.size / 1e6,
      gigabytes: stats.size / 1e9,
    },
    createdAt: {
      date: stats.ctime,
      milliseconds: stats.ctimeMs,
    },
    updatedAt: {
      date: stats.mtime,
      milliseconds: stats.mtimeMs,
    },
  }
}
