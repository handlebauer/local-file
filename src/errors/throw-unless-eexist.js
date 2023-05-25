import { LocalFileError } from './LocalFileError.js'

/**
 * @param {any} error
 */
export const throwUnlessEEXIST = error =>
  error.code === 'EEXIST'
    ? null
    : Promise.reject(
        new LocalFileError('throwUnlessEEXIST', {
          message: 'failed during write',
          parent: error,
        })
      )
