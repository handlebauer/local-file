import { LocalFileError } from './LocalFileError.js'

/**
 * @param {any} error
 */
export const throwUnlessENOENT = error =>
  error.code === 'ENOENT'
    ? null
    : Promise.reject(
        new LocalFileError('throwUnlessENOENT', {
          message: 'failed during write',
          parent: error,
        })
      )
