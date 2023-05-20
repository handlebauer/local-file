/**
 * @param {any} error
 */
export const throwUnlessEEXIST = error =>
  error.code === 'EEXIST' ? null : Promise.reject(error)
