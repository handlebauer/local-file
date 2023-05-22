import _test from 'ava'
import { LocalFile } from '../LocalFile.js'
import { LocalFileError } from '../errors/LocalFileError.js'
import { mkdir, rm, writeFile } from 'fs/promises'
import { sleep } from '@hbauer/convenience-functions'

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

/**l
 *
 * HANDLERS
 *
 */

test.beforeEach('test', async _ => {
  await mkdir(fileDirectory, { recursive: true })
  await writeFile(json.path, JSON.stringify(json.data))

  await sleep(10)
})

test.afterEach('test', async _ => {
  await rm(baseDirectory, { recursive: true })

  await sleep(10)
})

test('Should throw an error upon invoking `newThan`/`olderThan` if the duration provided is invalid', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  const instanceOf = LocalFileError

  await t.throwsAsync(() => jsonFile.olderThan(null), { instanceOf })
  // @ts-ignore
  await t.throwsAsync(() => jsonFile.olderThan(Symbol()), { instanceOf })
  // @ts-ignore
  await t.throwsAsync(() => jsonFile.olderThan(['1 day']), { instanceOf })
  // @ts-ignore
  await t.throwsAsync(() => jsonFile.olderThan([2, 'day']), { instanceOf })
  await t.throwsAsync(() => jsonFile.olderThan([1, 'days']), { instanceOf })
})

test('Should return false upon invoking `olderThan` if the file is newer than the provided duration', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  t.false(await jsonFile.olderThan([99, 'days']))
})

test('Should return true upon invoking `olderThan` if the file is older than the provided duration', async t => {
  const jsonFile = await LocalFile.read(json.path, json.decoder)

  t.true(await jsonFile.olderThan([0, 'milliseconds']))
})
