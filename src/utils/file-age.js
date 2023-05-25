import { LocalFile } from '../LocalFile.js'
import { LocalFileError } from '../errors/LocalFileError.js'

const s = 1e3
const m = s * 60
const h = m * 60
const d = h * 24
const w = d * 7
const M = d * (365 / 12)
const y = d * 365

/**
 * @param {LocalFile<any>} file
 */
export const fileAge = async file => {
  if (file instanceof LocalFile === false) {
    throw new LocalFileError({
      title: 'fileAge',
      description: 'parameter must be an instance of `LocalFile`',
    })
  }

  const stats = await LocalFile.getStats(file.path)

  const now = Date.now()

  const created = now - stats.createdAt.milliseconds
  const updated = now - stats.updatedAt.milliseconds

  return /** @type {const} */ ({
    created: {
      milliseconds: created,
      seconds: created / s,
      minutes: created / m,
      hours: created / h,
      days: created / d,
      months: created / M,
      weeks: created / w,
      years: created / y,
    },
    updated: {
      milliseconds: updated,
      seconds: updated / s,
      minutes: created / m,
      hours: updated / h,
      days: updated / d,
      months: updated / M,
      weeks: updated / w,
      years: updated / y,
    },
  })
}
