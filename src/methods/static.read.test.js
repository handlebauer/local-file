import _test from 'ava'
import { mkdir, readFile, rm, writeFile } from 'fs/promises'
import { sleep } from '@hbauer/convenience-functions'
import { LocalFile } from '../LocalFile.js'
import { LocalFileError } from '../errors/LocalFileError.js'

const test = _test.serial // run all tests serially, as creating/removing files is hard to reason about otherwise

/**
 *
 * MOCK DATA
 *
 */

const baseDirectory = '__test-LocalFile.read'
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

test('Should read a file from the local filesystem and return a new instance', async t => {
  const jsonPath = `${json.path}?test=read&type=json` // different than the default

  await writeFile(jsonPath, JSON.stringify(json.data))
  const savedJsonData = await readFile(jsonPath, 'utf-8').then(JSON.parse)

  const jsonFile = await LocalFile.read(jsonPath, JSON.parse)

  t.is(jsonFile.path, jsonPath)
  t.deepEqual(jsonFile.data, json.data)
  t.deepEqual(jsonFile.data, savedJsonData)
  t.is(jsonFile.type, json.type)

  await sleep(10)

  t.true(jsonFile.createdAt.date <= new Date())

  const htmlPath = `${json.path}?test=read&type=html` // different than the default

  await writeFile(htmlPath, html.data)
  const savedHtmlData = await readFile(htmlPath, 'utf-8')
  const htmlFile = await LocalFile.read(htmlPath, html => html)

  t.is(htmlFile.path, htmlPath)
  t.is(htmlFile.data, html.data)
  t.is(htmlFile.data, savedHtmlData)
  t.is(htmlFile.type, html.type)

  await sleep(10)

  t.true(htmlFile.createdAt.date <= new Date())
})

test("Should throw an error if the provided path doesn't exist", async t => {
  const jsonPath = `${json.path}?test=read&type=json` // different than the default

  await t.throwsAsync(() => LocalFile.read(jsonPath, JSON.parse), {
    instanceOf: LocalFileError,
  })
})

test('Should throw an error if the provided decoder fails during decoding', async t => {
  await t.throwsAsync(() => LocalFile.read(html.path, JSON.parse), {
    instanceOf: LocalFileError,
  })
})
