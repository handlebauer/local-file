/**
 * @param {Error & NodeJS.ErrnoException} nativeError
 */
const isErrnoException = nativeError => typeof nativeError?.code === 'string'

export class LocalFileError extends Error {
  /**
   * @param {{ title?: string, description?: string, parent?: Error & NodeJS.ErrnoException }} params
   */
  constructor({ title, description, parent }) {
    super()

    if (title) {
      this.message = title + ' error'
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
