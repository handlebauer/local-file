/**
 * @typedef {'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'} LocalFileTimeUnitSingular
 * @typedef {'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'} LocalFileTimeUnitPlural
 * @typedef {LocalFileTimeUnitSingular | LocalFileTimeUnitPlural} LocalFileTimeUnit
 *
 * @typedef {[1, LocalFileTimeUnitSingular]} LocalFileTimeArraySingular
 * @typedef {[Exclude<number, 1>, LocalFileTimeUnitPlural]} LocalFileTimeArrayPlural
 * @typedef {LocalFileTimeArraySingular | LocalFileTimeArrayPlural} LocalFileTimeArray
 *
 * @typedef {{
 * date: Date
 * milliseconds: number
 * }} LocalFileStatTime
 *
 * @typedef {{
 * size: number
 * createdAt: LocalFileStatTime
 * updatedAt: LocalFileStatTime
 * }} LocalFileStats
 */

export {}
