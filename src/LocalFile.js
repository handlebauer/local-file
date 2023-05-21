import { timeSinceFile } from '@hbauer/time-since-file'
import { plural } from '@hbauer/convenience-functions'
import { LocalFileError } from './errors/LocalFileError.js'
import { save } from './methods/static.save.js'
import { read } from './methods/static.read.js'
import { getStats } from './methods/static.getStats.js'

/**
 * @typedef {import('./LocalFile.types.js').LocalFileTimeArray} LocalFileTimeArray
 * @typedef {import('./LocalFile.types.js').LocalFileTimeUnit} LocalFileTimeUnit
 */

export class LocalFile {
  /**
   * @public
   * @param {string} path
   * @param {string | Record<string, any>} data
   * @param {LocalFileStats} stats
   */
  static ensureConstructorParams(path, data, stats) {
    if (path === null) {
      throw new LocalFileError({
        title: 'constructor',
        description: `path must be defined (found: ${path})`,
      })
    }

    if (data === null) {
      throw new LocalFileError({
        title: 'constructor',
        description: `data must be defined (found: ${data})`,
      })
    }

    if (stats === null) {
      throw new LocalFileError({
        title: 'constructor',
        description: `stats must be defined (found: ${stats})`,
      })
    }
  }

  /**
   * @param {string} path
   * @param {string | Record<string, any>} data
   * @param {LocalFileStats} stats
   */
  constructor(path = null, data = null, stats = null) {
    LocalFile.ensureConstructorParams(path, data, stats)

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
    this.data = data

    /**
     * @public
     */
    this.expired = false

    /**
     * @public
     * @readonly
     */
    this.createdAt = stats.createdAt || null
  }

  /**
   * The JavaScript type attributed to the data
   *
   * @public
   */
  get type() {
    return typeof this.data
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

  expire() {
    this.expired = true
    return this
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
      throw new LocalFileError({
        title: 'toJSON',
        description: `file is of type ${this.type}, which is incompatible with JSON.stringify`,
      })
    }

    return this.data
  }

  toString() {
    return this.type === 'string' ? this.data : JSON.stringify(this.data)
  }
}

/**
 * @public
 * @param {string} path
 * @param {string | Record<string, any>} data
 * @param {(data: string | Record<string, any>) => string} encode
 */
LocalFile.save = save

/**
 * @typedef {import("./LocalFile.types.js").LocalFileStats} LocalFileStats
 *
 * @public
 * @param {string} path
 * @param {(data: string) => string | Record<string, any>} decode
 * @param {LocalFileStats} [stats]
 */

LocalFile.read = read

/**
 * Returns file statistics if and only if the file exists
 *
 * @public
 * @param {string} path
 * @returns {Promise<LocalFileStats>}
 */
LocalFile.getStats = getStats
