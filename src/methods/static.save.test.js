import _test from 'ava'
import { mkdir, readFile, rm, stat, writeFile } from 'fs/promises'
import { sleep } from '@hbauer/convenience-functions'
import { randomString } from 'remeda'
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

  await sleep(10)
})

test.afterEach('test', async _ => {
  await rm(baseDirectory, { recursive: true })

  await sleep(10)
})

test('Should throw an error if the provided path is empty or of an incompatible type', async t => {
  const instanceOf = LocalFileError

  await t.throwsAsync(() => LocalFile.save(null, json.data, JSON.stringify), {
    instanceOf,
  })

  await t.throwsAsync(() => LocalFile.save('', json.data, JSON.stringify), {
    instanceOf,
  })

  await t.throwsAsync(
    // @ts-ignore
    () => LocalFile.save(Symbol('not a string'), json.data, JSON.stringify),
    { instanceOf }
  )
})

test('Should throw an error if the provided data is nullish or of an incompatible type', async t => {
  const instanceOf = LocalFileError

  await t.throwsAsync(() => LocalFile.save(json.path, null, JSON.stringify), {
    instanceOf,
  })

  // @ts-ignore
  await t.throwsAsync(() => LocalFile.save(json.path, 0, JSON.stringify), {
    instanceOf,
  })

  await t.throwsAsync(() => LocalFile.save(json.path, '', JSON.stringify), {
    instanceOf,
  })

  await t.throwsAsync(
    // @ts-ignore
    () =>
      // @ts-ignore
      LocalFile.save(json.path, Symbol('incompatible type'), JSON.stringify),
    { instanceOf }
  )
})

test('Should write a file to the local filesystem and return a new instance', async t => {
  const jsonFile = await LocalFile.save(json.path, json.data, JSON.stringify)
  await sleep(10)

  const savedJsonData = await readFile(json.path, 'utf-8').then(JSON.parse)

  t.is(jsonFile.path, json.path)
  t.deepEqual(jsonFile.data, json.data)
  t.deepEqual(jsonFile.data, savedJsonData)
  t.is(jsonFile.type, json.type)

  t.true(jsonFile.createdAt.date <= new Date())

  const encode = (/** @type {string} */ html) => html
  const htmlFile = await LocalFile.save(html.path, html.data, encode)
  await sleep(10)

  const savedHtmlData = await readFile(html.path, 'utf-8')

  t.is(htmlFile.path, html.path)
  t.is(htmlFile.data, html.data)
  t.is(htmlFile.data, savedHtmlData)
  t.is(htmlFile.type, html.type)

  t.true(htmlFile.createdAt.date <= new Date())
})

test('Should overwrite a file and return a new instance if the file already exists', async t => {
  await writeFile(json.path, JSON.stringify(json.data))

  const existing = await stat(json.path)
  t.true(existing.isFile())

  await sleep(10)

  const overwritten = await LocalFile.save(json.path, json.data, JSON.stringify)

  t.is(overwritten.path, json.path)
  t.deepEqual(overwritten.data, json.data)
  t.is(overwritten.type, json.type)

  t.true(overwritten.createdAt.milliseconds > existing.ctimeMs)
})

test('Should return an existing file if the file already exists and `returnExisting` is true', async t => {
  await writeFile(json.path, JSON.stringify(json.data))

  const existing = await stat(json.path)
  t.true(existing.isFile())

  await sleep(10)

  const overwritten = await LocalFile.save(
    json.path,
    json.data,
    JSON.stringify,
    {
      returnExisting: true,
    }
  )

  t.is(overwritten.path, json.path)
  t.deepEqual(overwritten.data, json.data)
  t.is(overwritten.type, json.type)

  t.true(overwritten.createdAt.milliseconds === existing.ctimeMs)
})

test('Should throw an error if provided encoder fails while encoding', async t => {
  const instanceOf = LocalFileError

  await t.throwsAsync(
    () =>
      // @ts-ignore
      LocalFile.save(randomString(10), { purposeful: 'error' }, JSON.parse),
    { instanceOf }
  )
})
