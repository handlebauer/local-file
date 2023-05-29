import _test from 'ava'
import { mkdir, rm, writeFile } from 'fs/promises'
import { readFile } from 'fs/promises'
import { sleep } from '@hbauer/convenience-functions'
import { LocalFile } from './LocalFile.js'
import { LocalFileError } from './errors/LocalFileError.js'

const test = _test.serial // run all tests serially, as creating/removing files is hard to reason about otherwise

/**
 *
 * MOCK DATA
 *
 */

const baseDirectory = '__test-LocalFile'
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

/**l
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

/**
 *
 * CONSTRUCTOR
 *
 */

test('Should return valid instances with sensible defaults upon initialization', async t => {
  const jsonFile = new LocalFile(
    json.path,
    json.data,
    await LocalFile.getStats(json.path)
  )

  t.is(jsonFile.path, json.path)
  t.deepEqual(jsonFile.data, json.data)
  t.is(jsonFile.type, json.type)
  t.true(jsonFile.createdAt.date <= new Date())

  const htmlFile = new LocalFile(
    html.path,
    html.data,
    await LocalFile.getStats(html.path)
  )

  t.is(htmlFile.path, html.path)
  t.is(htmlFile.data, html.data)
  t.is(htmlFile.type, html.type)
  t.is(htmlFile.size, html.data.length)

  await sleep(10)

  t.true(htmlFile.createdAt.date <= new Date())
})

test('Should return an error upon initialization if required parameters are not provided', async t => {
  const instanceOf = LocalFileError

  await t.throwsAsync(
    async () =>
      new LocalFile(null, json.path, await LocalFile.getStats(json.path)),
    { instanceOf }
  )

  await t.throwsAsync(
    async () =>
      new LocalFile(json.path, null, await LocalFile.getStats(json.path)),
    { instanceOf }
  )

  t.throws(() => new LocalFile(json.path, json.path), {
    instanceOf,
  })
})

/**
 *
 * `rm` METHOD
 *
 */

test('Should remove an existing file from the local filesystem', async t => {
  const file = await LocalFile.save(json.path, json.data, JSON.stringify) // write a new file

  await t.notThrowsAsync(() => readFile(json.path, 'utf-8')) // read newly created file

  await t.notThrowsAsync(() => file.rm()) // remove newly created file

  await t.throwsAsync(() => readFile(json.path, 'utf-8'), {
    code: 'ENOENT',
  }) // read newly removed file

  await t.throwsAsync(() => file.rm()) // remove newly removed file
})

/**
 *
 * `sinceUpdatedd` METHOD
 *
 */

test('Should return valid duration since last update when invoking `sinceUpdated`', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  t.true((await jsonFile.sinceUpdated('milliseconds')) > 0)
  t.true((await jsonFile.sinceUpdated('seconds')) < 10)
})

test('Should return valid duration since file creation when invoking `sinceCreated`', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  t.true((await jsonFile.sinceCreated('milliseconds')) > 0)
  t.true((await jsonFile.sinceCreated('seconds')) < 10)
})

/**
 *
 * `setAttribute` METHOD
 *
 */

test('Should allow arbitrary attributes to be set under the `attributes` property', async t => {
  let jsonFile = await LocalFile.read(json.path, json.decoder)

  jsonFile.attributes.cached = true
  jsonFile.attributes.expired = true

  t.is(jsonFile.attributes.cached, true)
  t.is(jsonFile.attributes.expired, true)
})

/**
 *
 * `toJSON` method
 *
 */

test('Should return serialized JSON upon passing an instance to JSON.stringify', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  const serialized = JSON.stringify(jsonFile)

  t.is(typeof serialized, 'string')
  t.is(JSON.stringify(json.data), serialized)
})

test('Should return serialized JSON upon passing a JSON instance to JSON.stringify', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)
  const serialized = JSON.stringify(jsonFile)

  t.is(typeof serialized, 'string')
  t.is(JSON.stringify(json.data), serialized)
})

test('Should throw an error upon passing an HTML instance to JSON.stringify', async t => {
  const htmlFile = await LocalFile.read(html.path, html.decoder)

  t.throws(() => JSON.stringify(htmlFile), { instanceOf: LocalFileError })
})

/**
 *
 * `toString` METHOD
 *
 */

test('Should return serialized JSON upon calling `toString` with a JSON instance', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  t.is(jsonFile.toString(), JSON.stringify(json.data))
})

test('Should return the original HTML upon calling `toString` with an HTML instance', async t => {
  const htmlFile = await LocalFile.read(html.path, html.decoder)

  t.is(htmlFile.toString(), html.data)
})
