# @hbauer/local-file

## Install

```sh
$ yarn add @hbauer/local-file
$ npm install @hbauer/local-file
```

## Usage

```js
import { LocalFile } from '@hbauer/local-file'

const path = 'src/path/to/data'
const data = { foo: 'bar' }

const savedFile = await LocalFile.save(path, data)

assert(savedFile.data === data)
assert(typeof savedFile.createdAt.date === 'date')
assert(typeof savedFile.createdAt.milliseconds === 'number')

const file = await LocalFile.read(path, data) // throws error if the file doesn't exist

assert.deepEqual(savedFile.data, file.data)

// TODO: finish readme
```
