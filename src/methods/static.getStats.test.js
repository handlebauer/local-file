import _test from 'ava'
import { mkdir, rm, writeFile } from 'fs/promises'
import { sleep, typeOf } from '@hbauer/convenience-functions'
import { getStats } from './static.getStats.js'

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
  t.is(typeOf(stats.updatedAt.date), 'date')
  t.is(typeOf(stats.createdAt.milliseconds), 'number')
  t.is(typeOf(stats.updatedAt.milliseconds), 'number')
  t.is(typeOf(stats.size), 'number')
})

test("Should return null if the file doesn't exist", async t => {
  const stats = await getStats('hmLI0kw8bg8=rCsIrfKQ')

  t.is(stats, null)
})

test('Should return null if the provided path is nullish or not a string', async t => {
  t.is(await getStats(null), null)
  t.is(await getStats(undefined), null)

  // @ts-ignore
  t.is(await getStats(0), null)

  // @ts-ignore
  t.is(await getStats(new Date()), null)

  // @ts-ignore
  t.is(await getStats(Symbol('what')), null)
})
