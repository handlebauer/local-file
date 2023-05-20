# @hbauer/local-file

## Install

```sh
$ yarn add @hbauer/local-file
$ npm install @hbauer/local-file
```

```js
import { LocalFile } from '@hbauer/local-file'

const data = { foo: 'bar' }

const { path } = saveData(JSON.stringify(data)) // save some data somewhere

const file = LocalFile.initialize(path, data)

assert(file.data === data)
assert(typeof file.createdAt.date === 'date')
assert(typeof file.createdAt.milliseconds === 'number')
// etc.
```
