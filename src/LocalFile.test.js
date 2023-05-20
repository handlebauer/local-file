import _test from 'ava'
import { mkdir, readFile, rm, writeFile } from 'fs/promises'
import { sleep } from '@hbauer/convenience-functions'
import { LocalFile } from './LocalFile.js'

const test = _test.serial // run all tests serially, as creating/removing files is hard to reason about otherwise

const baseDirectory = 'test-local-file'
const fileDirectory = 'test-local-file/to'

const json = {
  path: 'test-local-file/to/json',
  data: { foo: 'bar' },
  type: typeof {},
  encoder: JSON.stringify,
  decoder: JSON.parse,
}

const html = {
  path: 'test-local-file/to/html',
  data: '<html><head><title>hello</title></head><body>world</body></html>',
  type: typeof '',
  encoder: (/** @type {string} */ html) => html,
  decoder: (/** @type {string} */ html) => html,
}

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

test('Should return valid instances with sensible defaults upon initialization', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  t.is(jsonFile.path, json.path)
  t.deepEqual(jsonFile.data, json.data)
  t.is(jsonFile.type, json.type)
  t.true(jsonFile.createdAt.date <= new Date())
  t.true((await jsonFile.updatedAt).date < new Date())

  const htmlFile = await LocalFile.read(html.path, html.decoder)

  t.is(htmlFile.path, html.path)
  t.is(htmlFile.data, html.data)
  t.is(htmlFile.type, html.type)
  t.true(htmlFile.createdAt.date < new Date())
  t.true((await htmlFile.updatedAt).date < new Date())
})

test('Should write a file to the local filesystem and return a new instance upon invoking the `save` method', async t => {
  const jsonPath = `${json.path}?test=save&type=json` // different than the default
  const jsonFile = await LocalFile.save(jsonPath, json.data, JSON.stringify)

  const savedJsonData = await readFile(jsonPath, 'utf-8').then(JSON.parse)

  t.is(jsonFile.path, jsonPath)
  t.deepEqual(jsonFile.data, json.data)
  t.deepEqual(jsonFile.data, savedJsonData)
  t.is(jsonFile.type, json.type)
  t.true(jsonFile.createdAt.date <= new Date())
  t.true((await jsonFile.updatedAt).date <= new Date())

  const htmlPath = `${json.path}?test=save&type=html` // different than the default
  const encode = (/** @type {string} */ html) => html
  const htmlFile = await LocalFile.save(htmlPath, html.data, encode)

  const savedHtmlData = await readFile(htmlPath, 'utf-8')

  t.is(htmlFile.path, htmlPath)
  t.is(htmlFile.data, html.data)
  t.is(htmlFile.data, savedHtmlData)
  t.is(htmlFile.type, html.type)
  t.true(htmlFile.createdAt.date <= new Date())
  t.true((await htmlFile.updatedAt).date <= new Date())
})

test('Should read a file and return a new instance upon invoking the `save` method if the already exists', async t => {
  const jsonFile = await LocalFile.save(json.path, json, JSON.stringify)

  t.is(jsonFile.path, json.path)
  t.is(jsonFile.data, json)
  t.is(jsonFile.type, json.type)
  t.true(jsonFile.createdAt.date <= new Date())
  t.true((await jsonFile.updatedAt).date < new Date())
})

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

test('Should return false upon invoking `olderThan` if the file is newer than the provided duration', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  t.false(await jsonFile.olderThan([99, 'days']))
})

test('Should return true upon invoking `olderThan` if the file is older than the provided duration', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  t.true(await jsonFile.olderThan([0, 'milliseconds']))
})

test('Should return false upon invoking `newerThan` if the file is newer than the provided duration', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  t.false(await jsonFile.newerThan([0, 'days']))
})

test('Should return true upon invoking `newerThan` if the file is older than the provided duration', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  t.true(await jsonFile.newerThan([99, 'days']))
})

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

  t.throws(() => JSON.stringify(htmlFile))
})

test('Should return serialized JSON upon calling `toString` with a JSON instance', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  t.is(jsonFile.toString(), JSON.stringify(json.data))
})

test('Should return the original HTML upon calling `toString` with an HTML instance', async t => {
  const htmlFile = await LocalFile.read(html.path, html.decoder)

  t.is(htmlFile.toString(), html.data)
})
