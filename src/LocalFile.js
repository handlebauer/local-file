import { forEach, isTruthy, pipe } from 'remeda'
import { plural } from '@hbauer/convenience-functions'
import { LocalFileError } from './errors/LocalFileError.js'
import * as methods from './methods/index.js'
import * as utils from './utils/index.js'

/**
 * @typedef {import('./LocalFile.types.js').JSONObject} JSONObject
 * @typedef {import('./LocalFile.types.js').JSONArray} JSONArray
 * @typedef {import('./LocalFile.types.js').JSONData} JSONData
 * @typedef {import('./LocalFile.types.js').HTMLData} HTMLData
 *
 * @typedef {import('./LocalFile.types.js').LocalFileData} LocalFileData
 * @typedef {import('./LocalFile.types.js').LocalFileAccepts} LocalFileAccepts
 *
 * @typedef {import('./parameters/common.js').LocalFilePath} LocalFilePath
 * @typedef {import('./parameters/file-age.js').FileAgeDurationUnit} FileAgeDurationUnit
 * @typedef {import('./parameters/file-age.js').LocalFileAgeDuration} LocalFileAgeDuration
 * @typedef {import("./LocalFile.types.js").LocalFileStats} LocalFileStats
 */

/**
 * @template Data
 * @typedef {Data extends JSONData ? Data extends JSONArray ? JSONArray : JSONObject : Data extends HTMLData ? HTMLData : any} LocalFileDataType
 */

/**
 * @template {LocalFileAccepts} Data
 */
export class LocalFile {
  /**
   * @typedef {ConstructorParameters<typeof LocalFile<any>>} LocalFileConstructorParams
   *
   * @private
   * @param {{ path: LocalFilePath, data: LocalFileAccepts, stats: LocalFileStats }} args
   */
  static ensureConstructorParams(args) {
    /**
     * @param {[string, LocalFileConstructorParams[number]]} argArray
     */
    const throwIfNil = ([name, arg]) => {
      if (isTruthy(arg) === false) {
        throw new LocalFileError('constructor parameters', {
          message: `${name} must be defined (found: ${arg})`,
        })
      }
    }

    pipe(Object.entries(args), forEach(throwIfNil))
  }

  /**
   * @param {string} path
   * @param {LocalFileAccepts} data
   * @param {LocalFileStats} stats
   */
  constructor(path = null, data = null, stats = null) {
    LocalFile.ensureConstructorParams({ path, data, stats })

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
    this.data = /** @type {LocalFileDataType<Data>} */ (data)

    /**
     * @public
     */
    this.isCached = false

    /**
     * @public
     */
    this.isExpired = false

    /**
     * When the file was created
     *
     * Note: this value is only guaranteed to valid for the file when it
     * was instantiated as a LocalFile. The LocalFile instance may or
     * may not reflect the actual date of the file's creation as this
     * may have changed since; for instance, if the file was deleted and
     * re-created since this LocalFile was instantiated, the createdAt
     * value may be stale. It is safer to use the getStats() method as
     * it better reflects the file's current state on the file-system.
     *
     * @public
     * @readonly
     */
    this.createdAt = stats.createdAt || null

    /**
     * The length in bytes of the file
     *
     * Note: this value is only guaranteed to valid for the file when it
     * was instantiated as a LocalFile. The LocalFile instance may or
     * may not reflect the actual size of the file size as this may have
     * changed since; for instance, if the file was updated since the
     * LocalFile was instantiated, the size value may be stale. It is
     * safer to use the getStats() method as it better reflects the
     * file's actual state on the file-system at the time of invocation.
     *
     * @public
     * @readonly
     */
    this.size = stats.size.bytes || null
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
   * Current file statistics, e.g. time last updated
   *
   * @public
   */
  getStats() {
    return LocalFile.getStats(this.path)
  }

  /**
   * Get the time (by unit) since a file was last updated
   *
   * @public
   * @param {FileAgeDurationUnit} unit
   */
  async sinceUpdated(unit = 'milliseconds') {
    const since = await utils.fileAge(this)
    return since.updated[plural(unit)]
  }

  /**
   * Get the time (by unit) since a file was last updated
   *
   * @public
   * @param {FileAgeDurationUnit} unit
   */
  async sinceCreated(unit = 'milliseconds') {
    const since = await utils.fileAge(this)
    return since.created[plural(unit)]
  }

  /**
   * Mark file as cached
   *
   * @public
   */
  cached() {
    this.isCached = true
    return this
  }

  /**
   * Mark file as expired
   *
   * @public
   */
  expire() {
    this.isExpired = true
    return this
  }

  toJSON() {
    if (this.type === 'string') {
      throw new LocalFileError('toJSON', {
        message: `file's data is of type ${this.type}, which is incompatible with JSON.stringify`,
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
 *
 * @template {LocalFileAccepts} D
 *
 * @param {LocalFilePath} path
 * @param {D} data
 * @param {(data: LocalFileAccepts) => string} [encode]
 * @param {{ returnExisting?: boolean }} [options]
 * @returns {Promise<LocalFile<D>>}
 */
LocalFile.save = methods.save

/**
 * @public
 * @param {LocalFilePath} path
 * @param {(rawData: string) => LocalFileData} decode
 * @param {LocalFileStats} [stats]
 */
LocalFile.read = methods.read

/**
 * Returns file statistics if and only if the file exists
 *
 * @public
 * @param {LocalFilePath} path
 * @returns {Promise<LocalFileStats>}
 */
LocalFile.getStats = methods.getStats

/**
 * Returns true if the file is equal to or older than the specified duration
 *
 * @public
 * @param {LocalFileAgeDuration} duration
 */
LocalFile.prototype.olderThan = methods.olderThan

/**
 * Returns true if the file is equal to or newer than the specified duration
 *
 * @public
 * @param {LocalFileAgeDuration} duration
 */
LocalFile.prototype.newerThan = methods.newerThan
