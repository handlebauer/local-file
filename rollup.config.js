import pkg from './package.json' assert { type: 'json' }

const main = './src/index.js'
const utils = './src/utils/index.js'

const external = ['fs/promises', ...Object.keys(pkg.dependencies)]

// eslint-disable-next-line import/no-default-export
export default [
  {
    input: main,
    external,
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'esm' },
    ],
  },
  {
    input: utils,
    external,
    output: [
      { file: pkg.exports['./utils.js'].require, format: 'cjs' },
      { file: pkg.exports['./utils.js'].import, format: 'esm' },
    ],
  },
]
