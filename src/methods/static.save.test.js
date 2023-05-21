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

const baseDirectory = '__test-LocalFile.save'
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

test('Should throw an error if the provided path is empty or of an incompatible type', async t => {
  await t.throwsAsync(() => LocalFile.save(null, json, JSON.stringify), {
    instanceOf: LocalFileError,
  })

  await t.throwsAsync(() => LocalFile.save('', json, JSON.stringify), {
    instanceOf: LocalFileError,
  })

  await t.throwsAsync(
    // @ts-ignore
    () => LocalFile.save(Symbol('not a string'), json, JSON.stringify),
    {
      instanceOf: LocalFileError,
    }
  )
})

test('Should throw an error if the provided data is of an incompatible type', async t => {
  await t.throwsAsync(() => LocalFile.save(json.path, null, JSON.stringify), {
    instanceOf: LocalFileError,
  })

  await t.throwsAsync(() => LocalFile.save(json.path, '', JSON.stringify), {
    instanceOf: LocalFileError,
  })

  await t.throwsAsync(
    // @ts-ignore
    () =>
      // @ts-ignore
      LocalFile.save(json.path, Symbol('incompatible type'), JSON.stringify),
    {
      instanceOf: LocalFileError,
    }
  )
})

test('Should write a file to the local filesystem and return a new instance', async t => {
  const jsonPath = `${json.path}?test=save&type=json` // different than the default
  const jsonFile = await LocalFile.save(jsonPath, json.data, JSON.stringify)

  const savedJsonData = await readFile(jsonPath, 'utf-8').then(JSON.parse)

  t.is(jsonFile.path, jsonPath)
  t.deepEqual(jsonFile.data, json.data)
  t.deepEqual(jsonFile.data, savedJsonData)
  t.is(jsonFile.type, json.type)

  await sleep(10)

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

  await sleep(10)

  t.true(htmlFile.createdAt.date <= new Date())
  t.true((await htmlFile.updatedAt).date <= new Date())
})

test('Should read a file and return a new instance if the file already exists', async t => {
  const jsonFile = await LocalFile.save(json.path, json, JSON.stringify)

  t.is(jsonFile.path, json.path)
  t.is(jsonFile.data, json)
  t.is(jsonFile.type, json.type)

  await sleep(10)

  t.true(jsonFile.createdAt.date <= new Date())
  t.true((await jsonFile.updatedAt).date < new Date())
})

test('Should throw an error if provided encoder fails while encoding', async t => {
  await t.throwsAsync(
    () =>
      // @ts-ignore
      LocalFile.save('Nd+RmQsXN4', { purposefully: 'error' }, JSON.parse),
    {
      instanceOf: LocalFileError,
    }
  )
})
