import { stat } from 'fs/promises'
import { throwUnlessENOENT } from '../errors/throw-unless-enoent.js'

/**
 * Returns file statistics if and only if the file exists
 *
 * @typedef {import("../LocalFile.types.js").LocalFileStats} LocalFileStats
 *
 * @public
 * @param {string} path
 * @returns {Promise<LocalFileStats>}
 */
export async function getStats(path) {
  if (typeof path !== 'string') {
    return null
  }

  const stats = await stat(path).catch(throwUnlessENOENT)

  if (stats === null) {
    return null
  }

  return {
    size: stats.size,
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
