const prettier = require('prettier')
const cwd = process.cwd()
const path = require('path')
const jsdocParser = require(path.join(cwd, 'jsdoc_parser'))

function subject(code, options = {}) {
  return prettier.format(code, Object.assign(options, { parser: jsdocParser }))
}

test('JS code should be formatted as usuall', () => {
  const result = subject(`
const variable1 = 1             // No semicolon
const stringVar = "text"        // Wrong quotes
  const indented = 2            // Wrong indentation

// Longer then 80 characters
const someLongList = ['private', 'memberof', 'description', 'example', 'param', 'return', 'link']`)

  const expected = `const variable1 = 1; // No semicolon
const stringVar = "text"; // Wrong quotes
const indented = 2; // Wrong indentation

// Longer then 80 characters
const someLongList = [
  "private",
  "memberof",
  "description",
  "example",
  "param",
  "return",
  "link"
];
`
  expect(result).toEqual(expected)
})

test('Should format jsDoc', () => {
  const result1 = subject(`
/**
* function example description that was wrapped by hand
* so it have more then one line and don't end with a dot
* @returns {Boolean} Description for @return with s
* @param {String} text - some text description
* @param {Number|Null} [optionalNumber]
* @private
*/
const testFunction = (text, optionalNumber) => true
`)

  // TODO check what's wrong with wrapping long desciption text
  // TODO @private should don't have TODO description
  const expected1 = `/**
* @private TODO
* @description Function example description that was wrapped by hand
so it have more then one line and don't end with a dot.
* @param {String} text Some text description.
* @param {undefined} optionalNumber TODO
* @return {Boolean} Description for @return with s.
*/
const testFunction = (text, optionalNumber) => true;
`

  expect(result1).toEqual(expected1)
})

test.todo('spaces option')
