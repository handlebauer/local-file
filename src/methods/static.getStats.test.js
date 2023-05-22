import _test from 'ava'
import { mkdir, rm, writeFile } from 'fs/promises'
import { sleep, typeOf } from '@hbauer/convenience-functions'
import { getStats } from './static.getStats.js'
import { LocalFileError } from '../errors/LocalFileError.js'

const test = _test.serial // run all tests serially, as creating/removing files is hard to reason about otherwise

/**
 *
 * MOCK DATA
 *
 */

const baseDirectory = '__test-LocalFile.getStats'
const fileDirectory = `${baseDirectory}/to`

const json = {
  path: `${fileDirectory}/json`,
  data: { foo: 'bar' },
  type: typeof {},
  encoder: JSON.stringify,
  decoder: JSON.parse,
}

const html = {
  path: `${fileDirectory}/html`,
  data: '<html><head><title>hello</title></head><body>world</body></html>',
  type: typeof '',
  encoder: (/** @type {string} */ html) => html,
  decoder: (/** @type {string} */ html) => html,
}

/**
 *
 * HANDLERS
 *
 */

test.beforeEach('test', async _ => {
  await mkdir(fileDirectory, { recursive: true })
  await writeFile(json.path, JSON.stringify(json.data))
  await writeFile(html.path, html.data)

  await sleep(10)
})

test.afterEach('test', async _ => {
  await rm(baseDirectory, { recursive: true })

  await sleep(10)
})

test("Should generate stats for a file given the file's path", async t => {
  const stats = await getStats(json.path)

  t.is(typeOf(stats.createdAt.date), 'date')
  t.is(stats.createdAt.date.getDay(), new Date().getDay())

  t.is(typeOf(stats.updatedAt.date), 'date')
  t.is(stats.updatedAt.date.getDay(), new Date().getDay())

  t.is(typeOf(stats.createdAt.milliseconds), 'number')
  t.true(stats.updatedAt.milliseconds > Date.now() - 1e6)

  t.is(typeOf(stats.createdAt.milliseconds), 'number')
  t.true(stats.updatedAt.milliseconds > Date.now() - 1e6)

  t.is(typeOf(stats.size.bytes), 'number')
  t.is(stats.size.bytes, JSON.stringify(json.data).length)
})

test("Should return null if the file doesn't exist", async t => {
  const stats = await getStats('hmLI0kw8bg8=rCsIrfKQ')

  t.is(stats, null)
})

test('Should return an error if the provided path is nullish or not a string', async t => {
  const instanceOf = LocalFileError

  await t.throwsAsync(() => getStats(null), { instanceOf })
  await t.throwsAsync(() => getStats(undefined), { instanceOf })

  // @ts-ignore
  await t.throwsAsync(() => getStats(0), { instanceOf })

  // @ts-ignore
  await t.throwsAsync(() => getStats(Symbol('!string')), { instanceOf })
})
