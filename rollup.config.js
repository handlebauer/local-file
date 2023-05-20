import typescript from '@rollup/plugin-typescript'

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
      { file: pkg.exports['.'].require, format: 'cjs' },
      { file: pkg.exports['.'].import, format: 'esm' },
    ],
    plugins: [typescript({ tsconfig: './jsconfig.json' })],
  },
  {
    input: utils,
    external,
    output: [
      { file: pkg.exports['./utils'].require, format: 'cjs' },
      { file: pkg.exports['./utils'].import, format: 'esm' },
    ],
    plugins: [typescript({ tsconfig: './jsconfig.json' })],
  },
]
