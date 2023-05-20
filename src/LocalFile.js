import { readFile, stat } from 'fs/promises'
import { timeSinceFile } from '@hbauer/time-since-file'
import { plural } from '@hbauer/convenience-functions'
import { throwUnlessENOENT } from './utils/throw-unless-enoent.js'
import { writeToFile } from './utils/write-to-file.js'

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
   * @param {(data: string) => string | Record<string, any>} decode
   * @param {LocalFileStats} [stats]
   */
  static async read(path, decode, stats) {
    stats = stats || (await LocalFile.getStats(path))

    if (stats === null) {
      throw new Error(
        `LocalFile: read error: path to file (${path}) does not exist`
      )
    }

    const data = await readFile(path, 'utf-8').then(decode)

    return new LocalFile(path, data, stats)
  }

  /**
   * @public
   *
   * @param {string} path
   * @param {string | Record<string, any>} data
   * @param {(data: string | Record<string, any>) => string} encode
   */
  static async save(path, data, encode) {
    let stats = await LocalFile.getStats(path)

    /**
     * File already exists - return it
     */
    if (stats !== null) {
      return new LocalFile(path, data, stats)
    }

    if (typeof data === 'string') {
      await writeToFile(path, data)
    } else {
      let seralizedData = undefined
      try {
        seralizedData = encode(data)
      } catch (error) {
        throw new Error(
          `LocalFile: save error: unable to serialize data: ${error.message}`
        )
      }
      await writeToFile(path, seralizedData)
    }

    stats = await LocalFile.getStats(path)

    return new LocalFile(path, data, stats)
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

  get type() {
    return typeof this.data
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
    this.exists = !!stats

    /**
     * @public
     * @readonly
     */
    this.filename = path.split('/').at(-1)

    /**
     * @public
     * @readonly
     */
    this.data = data

    /**
     * @public
     * @readonly
     */
    this.createdAt = stats?.createdAt || null
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
    if (this.type === 'string') {
      throw new Error(
        `LocalFile: toJSON error: file has content of type \`${this.type}\`, which is incompatible`
      )
    }

    return this.data
  }

  toString() {
    return this.type === 'string' ? this.data : JSON.stringify(this.data)
  }
}
