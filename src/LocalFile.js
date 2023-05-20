import { stat } from 'fs/promises'
import { timeSinceFile } from '@hbauer/time-since-file'
import { plural } from '@hbauer/convenience-functions'
import { throwUnlessENOENT } from './utils/throw-unless-enoent.js'
import { writeToFile } from './utils/write-file.js'

/**
 * @typedef {import('./LocalFile.types.js').LocalFileTimeArray} LocalFileTimeArray
 * @typedef {import('./LocalFile.types.js').LocalFileTimeUnit} LocalFileTimeUnit
 * @typedef {import('./LocalFile.types.js').LocalFileStats} LocalFileStats
 */

export class LocalFile {
  /**
   * @public
   *
   * @param {string} path
   * @param {string | Record<string, any>} data
   * @param {LocalFileStats} [stats]
   */
  static async load(path, data, stats) {
    stats = stats || (await LocalFile.getStats(path))

    if (stats === null) {
      throw new Error(
        `LocalFile: initialization error: path to file (${path}) does not exist`
      )
    }

    return new LocalFile(path, data, stats)
  }

  /**
   * @public
   *
   * @param {string} path
   * @param {string | Record<string, any>} data
   */
  static async save(path, data) {
    const stats = await LocalFile.getStats(path)

    /**
     * The file already exists - return it
     */
    if (stats !== null) {
      return LocalFile.load(path, data, stats)
    }

    if (typeof data === 'string') {
      await writeToFile(path, data)
    } else {
      /**
       * If the data isn't of type 'string' then we try to serialize the
       * data assuming it's JSON. If this fails, throw an error.
       */
      let seralizedData = undefined
      try {
        seralizedData = JSON.stringify(data)
      } catch (_) {
        throw new Error(
          `LocalFile: save error: unable to serialize data using JSON.stringify`
        )
      }
      await writeToFile(path, seralizedData)
    }

    return LocalFile.load(path, data, stats)
  }

  /**
   * Returns file statistics if and only if the file exists
   *
   * @private
   * @param {string} path
   * @returns {Promise<LocalFileStats>}
   */
  static async getStats(path) {
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

  /**
   * @param {string | Record<string, any>} data
   */
  static getContentType(data) {
    return typeof data === 'string' ? 'html' : 'json'
  }

  /**
   * @param {string} path
   * @param {string | Record<string, any>} data
   * @param {LocalFileStats} stats
   */
  constructor(path, data, stats) {
    /**
     * @public
     * @readonly
     */
    this.path = path

    /**
     * @public
     * @readonly
     */
    this.filename = path.split('/').at(-1)

    /**
     * @public
     * @readonly
     */
    this.contentType = LocalFile.getContentType(data)

    /**
     * @public
     * @readonly
     */
    this.data = data

    /**
     * @public
     * @readonly
     */
    this.createdAt = stats.createdAt
  }

  /**
   * When the file was last updated (returns a promise)
   *
   * @public
   */
  get updatedAt() {
    return LocalFile.getStats(this.path).then(stats => stats.updatedAt)
  }

  /**
   * The byte length of the file (returns a promise)
   *
   * @public
   */
  get size() {
    return LocalFile.getStats(this.path).then(stats => stats.size)
  }

  /**
   * Returns true if the file is equal to or older than the specified duration
   *
   * @public
   * @param {LocalFileTimeArray} duration
   */
  async olderThan(duration) {
    const [input, unit] = duration

    const actual = await this.sinceUpdated(unit)

    return input <= actual
  }

  /**
   * Returns true if the file is equal to or newer than the specified duration
   *
   * @public
   * @param {LocalFileTimeArray} duration
   */
  async newerThan(duration) {
    const [input, unit] = duration

    const actual = await this.sinceUpdated(unit)

    return input >= actual
  }

  /**
   * Get the time (per unit) since a file was last updated
   *
   * @public
   * @param {LocalFileTimeUnit} unit
   */
  async sinceUpdated(unit = 'milliseconds') {
    const since = await timeSinceFile(this.path)
    return since.updated[plural(unit)]
  }

  /**
   * Get the time (per unit) since a file was last updated
   *
   * @public
   * @param {LocalFileTimeUnit} unit
   */
  async sinceCreated(unit) {
    const since = await timeSinceFile(this.path)
    return since.created[plural(unit)]
  }

  toJSON() {
    if (typeof this.data === 'string') {
      throw new Error(
        `LocalFile: toJSON error: file has content of type \`${this.contentType}\`, which is incompatible`
      )
    }

    return this.data
  }

  toString() {
    return typeof this.data === 'string' ? this.data : JSON.stringify(this.data)
  }
}
