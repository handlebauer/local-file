import { z } from 'zod'

/** @typedef {z.infer<typeof filePath>} LocalFilePath */
export const filePath = z.string().nonempty()

/** @typedef {z.infer<typeof fileAccepts>} LocalFileAccepts */
export const fileAccepts = z.union([
  z.string().nonempty(),
  z.record(z.any(), z.any()),
])

/** @typedef {z.infer<typeof encodeFunction>} LocalFileEncodeFunction */
export const encodeFunction = z
  .function()
  .args(fileAccepts)
  .returns(z.string().nonempty())

/** @typedef {z.infer<typeof decodeFunction>} LocalFileEDecodeFunction */
export const decodeFunction = z
  .function()
  .args(z.string().nonempty())
  .returns(fileAccepts)
