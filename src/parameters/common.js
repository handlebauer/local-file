import { z } from 'zod'

/** @typedef {z.infer<typeof filePath>} LocalFilePath */
export const filePath = z.string().nonempty()

/** @typedef {z.infer<typeof contentType>} LocalFileContentType */
export const contentType = z.enum(['json', 'html']).default('json')

/**
 * From: https://zod.dev/?id=records
 *
 * NOTE: we're not worried about types (they're in LocalFile.types.js), just validation
 */
const JSONValue = z.union([z.string(), z.number(), z.boolean(), z.null()])
// @ts-ignore
export const JSONData = z.lazy(() =>
  z.union([JSONValue, z.array(JSONData), z.record(JSONData)])
)

export const accepts = z.any()

/** @typedef {z.infer<typeof encodeFunction>} LocalFileEncodeFunction */
export const encodeFunction = z
  .function()
  .args(accepts)
  .returns(z.string().nonempty())

/** @typedef {z.infer<typeof decodeFunction>} LocalFileEDecodeFunction */
export const decodeFunction = z
  .function()
  .args(z.string().nonempty())
  .returns(accepts)
