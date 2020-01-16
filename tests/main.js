const prettier = require('prettier')

const code = `
const foo = 1
const bar = 2

// one line comment

/**
 * jsDoc comment
 */

/* block comment in one line */

/*
block comment
in multiple lines
*/

function foo (/* comment inside code */)   {
return true        // one line comment 2
}
`

test('test tests ;d', () => {
  const result = prettier.format(code, {
    parser: 'jsdoc-parser',
    plugins: ['.']
  })

  console.log('------result:', result)
  expect(1 + 2).toBe(3)
})
