import { isNil } from 'remeda'
import { ZodError } from 'zod'

/**
 * @param {Error & NodeJS.ErrnoException} nativeError
 */
const isErrnoException = nativeError => typeof nativeError?.code === 'string'

/**
 * @param {ZodError} error
 */
const formatZodError = error => error.flatten().formErrors.join('\n')

export class LocalFileError extends Error {
  /**
   * @param {{ title?: string, description?: string | ZodError, formatDescription?: (description: any) => string, parent?: Error & NodeJS.ErrnoException }} params
   */
  constructor({ title, description, formatDescription, parent }) {
    super()

    if (title) {
      this.message = title + ' error'
    }

    if (isNil(formatDescription) === false) {
      description = formatDescription(description)
    }

    if (description instanceof ZodError) {
      if (isNil(formatDescription) === true) {
        description = formatZodError(description)
      }
    }

    if (title && description) {
      this.message += ': ' + description
    }

    if (description && !title) {
      this.message += description
    }

    if (parent) {
      this.message += '\n' + '[' + parent.message + ']'
    }

    if (isErrnoException(parent) === true) {
      this.code = parent.code
      this.isErrnoException = true
    }
  }
}
