import test from 'ava'
import { rm } from 'fs/promises'
import { sleep } from '@hbauer/convenience-functions'
import { fileAge } from './file-age.js'
import { LocalFile } from '../LocalFile.js'
import { throwUnlessENOENT } from '../errors/throw-unless-enoent.js'

const directory = '__test-file-age'

test.afterEach('test', async _ => {
  await sleep(100)
  await rm(directory, { recursive: true }).catch(throwUnlessENOENT)
})

test('Should require a LocalFile instance as a parameter', async t => {
  const path = directory + '/' + 'love/you'
  const file = await LocalFile.save(path, 'whatever', data => data.toString())

  // @ts-ignore
  await t.throwsAsync(() => fileAge('not a file'))
  await t.notThrowsAsync(() => fileAge(file))
})

test('Should return sensible durations', async t => {
  const path = directory + '/' + 'you/too'
  const file = await LocalFile.save(path, 'whatever', data => data.toString())

  await sleep(100)

  const since = await fileAge(file)

  t.true(since.updated.milliseconds > 100)
  t.true(since.updated.milliseconds < 105)
})
