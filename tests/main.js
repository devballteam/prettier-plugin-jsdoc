const prettier = require('prettier')
const path = require('path')
const fs = require('fs')
const cwd = process.cwd()
const code = fs.readFileSync(path.join(cwd, 'testFile.js'), { encoding: 'utf8' })

test('test tests ;d', () => {
  console.log('------result:\n', prettier.format(code, {
    parser: 'jsdoc-parser',
    plugins: ['.']
  }))
})
