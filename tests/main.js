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

test('Should format regular jsDoc', () => {
  const result = subject(`
/**
* function example description that was wrapped by hand
* so it have more then one line and don't end with a dot
* REPEATED TWO TIMES BECAUSE IT WAS EASIER to copy
* function example description that was wrapped by hand
* so it have more then one line and don't end with a dot
* @returns {Boolean} Description for @return with s
* @param {String|Number} text - some text description that is very long and needs to be wrapped
* @param {String} [defaultValue="defaultTest"] TODO
* @arg {Number|Null} [optionalNumber]
* @private
*@memberof test
* @examples
*   var one = 5
*   var two = 10
*
*   if(one > 2) { two += one }
*/
const testFunction = (text, defaultValue, optionalNumber) => true
`)

  const expected = `/**
 * @private
 * @memberof test
 * @description Function example description that was wrapped by hand so it have
 *              more then one line and don't end with a dot REPEATED TWO TIMES
 *              BECAUSE IT WAS EASIER to copy function example description that
 *              was wrapped by hand so it have more then one line and don't end
 *              with a dot.
 *
 * @example
 *  var one = 5;
 *  var two = 10;
 *
 *  if (one > 2) {
 *    two += one;
 *  }
 *
 * @param {String|Number} text Some text description that is very long and needs
 *                             to be wrapped.
 * @param {String} [defaultValue="defaultTest"] TODO.
 * @param {Number|Null} [optionalNumber] TODO.
 * @return {Boolean} Description for @return with s.
 */
const testFunction = (text, defaultValue, optionalNumber) => true;
`

  expect(result).toEqual(expected)
})

test('Should add empty line after @description and @example description if necessary', () => {
  const Result1 = subject(`/** single line description*/`)
  const Expected1 = `/**
 * @description Single line description.
 */
`
  const Result2 = subject(`/**
 * single line description
 * @example
 */`)
  const Expected2 = `/**
 * @description Single line description.
 *
 * @example
 */
`

  const Result3 = subject(`/**
 * single line description
 * @returns {Boolean} Always true
 * @example
 */`)
  const Expected3 = `/**
 * @description Single line description.
 *
 * @example
 *
 * @return {Boolean} Always true.
 */
`

  expect(Result1).toEqual(Expected1)
  expect(Result2).toEqual(Expected2)
  expect(Result3).toEqual(Expected3)
})

test.todo('spaces option')
