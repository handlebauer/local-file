/**
 *
 * @typedef {string | number | boolean | JSONObject | JSONArray} JSONValue
 * @typedef {{ [key: string]: JSONValue}} JSONObject
 * @typedef {JSONObject[]} JSONArray
 * @typedef {JSONObject | JSONArray} JSONData
 *
 * @typedef {string} HTMLData
 *
 * @typedef {JSONData | HTMLData} LocalFileData
 * @typedef {JSONData & HTMLData} LocalFileDataAll
 *
 * @typedef {{
 * date: Date
 * milliseconds: number
 * }} LocalFileStatTime
 *
 * @typedef {{
 * bytes: number
 * kilobytes: number
 * megabytes: number
 * gigabytes: number
 * }} FileSizeUnits
 *
 * @typedef {{
 * size: FileSizeUnits
 * createdAt: LocalFileStatTime
 * updatedAt: LocalFileStatTime
 * }} LocalFileStats
 */

export {}
