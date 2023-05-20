/**
 * @param {any} error
 */
export const throwUnlessENOENT = error =>
  error.code === 'ENOENT' ? null : Promise.reject(error)
