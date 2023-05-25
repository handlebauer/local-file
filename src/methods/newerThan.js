import { LocalFile } from '../LocalFile.js'
import { LocalFileError } from '../errors/LocalFileError.js'
import { fileAgeDuration } from '../parameters/file-age.js'

/**
 * @typedef {import('../parameters/file-age.js').LocalFileAgeDuration} LocalFileAgeDuration
 */

/**
 * @param {LocalFileAgeDuration} duration
 */
const validateParams = duration => {
  const validated = fileAgeDuration.safeParse(duration)

  if (validated.success === false) {
    throw new LocalFileError('olderThan[duration]', {
      parent: validated.error,
    })
  }

  return validated.data
}

/**
 * Returns true if the file is equal to or newer than the specified duration
 *
 * @public
 * @this {LocalFile<any>}
 * @param {LocalFileAgeDuration} duration
 */
export async function newerThan(duration) {
  const [input, unit] = validateParams(duration)

  const actual = await this.sinceUpdated(unit)

  return input >= actual
}
