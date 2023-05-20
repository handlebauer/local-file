import _test from 'ava'
import { mkdir, readFile, rm, writeFile } from 'fs/promises'
import { sleep } from '@hbauer/convenience-functions'
import { LocalFile } from './LocalFile.js'

const test = _test.serial // run all tests serially, as creating/removing files is hard to reason about otherwise

const directoryBase = 'path'
const directoryTo = 'path/to'

const pathToJson = 'path/to/json'
const json = { foo: 'bar' }

const pathToHtml = 'path/to/html'
const html = '<html><head><title>hello</title></head><body>world</body></html>'

test.beforeEach('test', async _ => {
  await mkdir(directoryTo, { recursive: true })
  await writeFile(pathToJson, JSON.stringify(json))
  await writeFile(pathToHtml, html)

  await sleep(100)
})

test.afterEach('test', async _ => {
  await rm(directoryBase, { recursive: true })
})

test('Should return valid instances with sensible defaults upon initialization', async t => {
  const jsonFile = await LocalFile.read(pathToJson, json)

  t.is(jsonFile.path, pathToJson)
  t.is(jsonFile.data, json)
  t.is(jsonFile.contentType, 'json')
  t.true(jsonFile.createdAt.date < new Date())
  t.true((await jsonFile.updatedAt).date < new Date())

  const htmlFile = await LocalFile.read(pathToHtml, html)

  t.is(htmlFile.path, pathToHtml)
  t.is(htmlFile.data, html)
  t.is(htmlFile.contentType, 'html')
  t.true(htmlFile.createdAt.date < new Date())
  t.true((await htmlFile.updatedAt).date < new Date())
})

test('Should write an unexisting file to the local filesystem and return a new instance upon invoking the `save` method', async t => {
  const path = 'path/to/json?test=save' // different than the default
  const jsonFile = await LocalFile.save(path, json)

  const savedData = await readFile(path, 'utf-8').then(JSON.parse)

  t.is(jsonFile.path, path)
  t.is(jsonFile.data, json)
  t.deepEqual(jsonFile.data, savedData)
  t.is(jsonFile.contentType, 'json')
  t.true(jsonFile.createdAt.date < new Date())
  t.true((await jsonFile.updatedAt).date < new Date())
})

test('Should read a file and return a new instance upon invoking the `save` method if the already exists', async t => {
  const jsonFile = await LocalFile.save(pathToJson, json)

  t.is(jsonFile.path, pathToJson)
  t.is(jsonFile.data, json)
  t.is(jsonFile.contentType, 'json')
  t.true(jsonFile.createdAt.date < new Date())
  t.true((await jsonFile.updatedAt).date < new Date())
})

test('Should return valid duration since last update when invoking `sinceUpdated`', async t => {
  const jsonFile = await LocalFile.read(pathToJson, json)

  t.true((await jsonFile.sinceUpdated('milliseconds')) > 1)
  t.true((await jsonFile.sinceUpdated('seconds')) < 10)
})

test('Should return valid duration since file creation when invoking `sinceCreated`', async t => {
  const jsonFile = await LocalFile.read(pathToJson, json)

  t.true((await jsonFile.sinceCreated('milliseconds')) > 1)
  t.true((await jsonFile.sinceCreated('seconds')) < 10)
})

test('Should return false upon invoking `olderThan` if the file is newer than the provided duration', async t => {
  const jsonFile = await LocalFile.read(pathToJson, json)

  t.false(await jsonFile.olderThan([99, 'days']))
})

test('Should return true upon invoking `olderThan` if the file is older than the provided duration', async t => {
  const jsonFile = await LocalFile.read(pathToJson, json)

  t.true(await jsonFile.olderThan([0, 'milliseconds']))
})

test('Should return false upon invoking `newerThan` if the file is newer than the provided duration', async t => {
  const jsonFile = await LocalFile.read(pathToJson, json)

  t.false(await jsonFile.newerThan([0, 'days']))
})

test('Should return true upon invoking `newerThan` if the file is older than the provided duration', async t => {
  const jsonFile = await LocalFile.read(pathToJson, json)

  t.true(await jsonFile.newerThan([99, 'days']))
})

test('Should return serialized JSON upon passing an instance to JSON.stringify', async t => {
  const jsonFile = await LocalFile.read(pathToJson, json)

  const serialized = JSON.stringify(jsonFile)

  t.is(typeof serialized, 'string')
  t.is(JSON.stringify(json), serialized)
})

test('Should return serialized JSON upon passing a JSON instance to JSON.stringify', async t => {
  const jsonFile = await LocalFile.read(pathToJson, json)
  const serialized = JSON.stringify(jsonFile)

  t.is(typeof serialized, 'string')
  t.is(JSON.stringify(json), serialized)
})

test('Should throw an error upon passing an HTML instance to JSON.stringify', async t => {
  const htmlFile = await LocalFile.read(pathToHtml, html)

  t.throws(() => JSON.stringify(htmlFile))
})

test('Should return serialized JSON upon calling `toString` with a JSON instance', async t => {
  const jsonFile = await LocalFile.read(pathToJson, json)

  t.is(jsonFile.toString(), JSON.stringify(json))
})

test('Should return the original HTML upon calling `toString` with an HTML instance', async t => {
  const htmlFile = await LocalFile.read(pathToHtml, html)

  t.is(htmlFile.toString(), html)
})
