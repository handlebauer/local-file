import { ZodError } from 'zod'
import { compact, flatten, map, pipe, uniq, values } from 'remeda'

/**
 * @param {ZodError} error
 */
export const formatFileAgeDurationError = error =>
  pipe(
    error.format(),
    values,
    // @ts-ignore
    map(obj => obj._errors || obj),
    compact,
    flatten(),
    uniq()
  ).join('\n')
