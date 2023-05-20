import _test from 'ava'
import { rm, stat } from 'fs/promises'
import { parseDirectory, writeToFile } from './write-to-file.js'

const test = _test.serial // run all tests serially, as creating/removing files is hard to reason about otherwise

const baseDirectory = 'test-write-to-file'
const directory = baseDirectory + '/' + 'to'
const path = directory + '/' + 'file'

test.afterEach('test', async _ => {
  try {
    await rm(baseDirectory, { recursive: true })
  } catch (error) {}
})

test('Should parse the directory from a variety of paths', t => {
  const paths = {
    a: 'top-level',
    b: 'nested/several/times/over',
  }

  t.is(parseDirectory(paths.a), null)
  t.is(parseDirectory(paths.b), 'nested/several/times')
})

test('Should create a file in a nested directory', async t => {
  await writeToFile(path, 'testing')

  const directoryStats = await stat(directory)
  const fileStats = await stat(path)

  t.is(directoryStats.isDirectory(), true)
  t.is(fileStats.isFile(), true)
})

test("Should create a file in a nested directory even if the path isn't normalized", async t => {
  await writeToFile('/////' + path + '////', 'testing')

  const directoryStats = await stat(directory)
  const fileStats = await stat(path)

  t.is(directoryStats.isDirectory(), true)
  t.is(fileStats.isFile(), true)
})

test('Should throw an error if the path is nullish', async t => {
  await t.throwsAsync(writeToFile(null, null))
})
