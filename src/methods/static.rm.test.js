import _test from 'ava'
import { mkdir, readFile, rm } from 'fs/promises'
import { sleep } from '@hbauer/convenience-functions'
import { LocalFile } from '../LocalFile.js'

const test = _test.serial // run all tests serially, as creating/removing files is hard to reason about otherwise

/**
 *
 * MOCK DATA
 *
 */

const baseDirectory = '__test-LocalFile.save'
const fileDirectory = `${baseDirectory}/to`

/**
 *
 * HANDLERS
 *
 */

const json = {
  path: `${fileDirectory}/json`,
  data: { foo: 'bar' },
  type: typeof {},
  encoder: JSON.stringify,
  decoder: JSON.parse,
}

test.beforeEach('test', async _ => {
  await mkdir(fileDirectory, { recursive: true })

  await sleep(10)
})

test.afterEach('test', async _ => {
  await rm(baseDirectory, { recursive: true })

  await sleep(10)
})

test('Should throw an error if the provided path is empty or of an incompatible type', async t => {
  await t.throwsAsync(() => LocalFile.rm(null))

  await t.throwsAsync(() => LocalFile.rm(''))

  await t.throwsAsync(
    // @ts-ignore
    () => LocalFile.rm(Symbol('not a string'))
  )
})

test('Should throw an error when attempting to remove a non-existent file', async t => {
  await t.throwsAsync(() => LocalFile.rm(json.path))
})

test('Should remove an existing file from the local filesystem', async t => {
  await LocalFile.save(json.path, json.data, JSON.stringify) // write a new file

  await t.notThrowsAsync(() => readFile(json.path, 'utf-8')) // read newly created file

  await t.notThrowsAsync(() => LocalFile.rm(json.path)) // remove newly created file

  await t.throwsAsync(() => readFile(json.path, 'utf-8'), {
    code: 'ENOENT',
  }) // read newly removed file
})
