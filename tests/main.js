const prettier = require('prettier')
const cwd = process.cwd()
const path = require('path')
const jsdocParser = require(path.join(cwd, 'jsdoc_parser'))

function subject(code, options = {}) {
  return prettier.format(code, {
    parser: 'jsdoc-parser',
    plugins: ['.'],
    jsdocSpaces: 1,
    jsdocPrintWidth: 80,
    ...options
  });
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
* so it have more then one line.
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
 *              was wrapped by hand so it have more then one line.
 *
 * @example
 *   var one = 5;
 *   var two = 10;
 *
 *   if (one > 2) {
 *     two += one;
 *   }
 *
 * @param {String|Number} text Some text description that is very long and needs
 *                             to be wrapped
 * @param {String} [defaultValue="defaultTest"] TODO
 * @param {Number|Null} [optionalNumber] TODO
 * @return {Boolean} Description for @return with s
 */
const testFunction = (text, defaultValue, optionalNumber) => true;
`

  expect(result).toEqual(expected)
  expect(subject(result)).toEqual(expected)
})

test('Should add empty line after @description and @example description if necessary', () => {
  const Result1 = subject(`/** single line description*/`)
  const Expected1 = `/**
 * @description Single line description
 */
`
  const Result2 = subject(`/**
 * single line description
 * @example
 */`)
  const Expected2 = `/**
 * @description Single line description
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
 * @description Single line description
 *
 * @example
 *
 * @return {Boolean} Always true
 */
`

  expect(Result1).toEqual(Expected1)
  expect(Result2).toEqual(Expected2)
  expect(Result3).toEqual(Expected3)
})

test('Should not add TODO for return desc if it has undefined|null|void type', () => {
  const Result1 = subject(`/**
 * @returns {undefined}
 */`)
  const Expected1 = `/**
 * @return {undefined}
 */
`

  const Result2 = subject(`/**
 * @returns {null}
 */`)
  const Expected2 = `/**
 * @return {null}
 */
`

  const Result3 = subject(`/**
 * @returns {void}
 */`)
  const Expected3 = `/**
 * @return {void}
 */
`

  expect(Result1).toEqual(Expected1)
  expect(Result2).toEqual(Expected2)
  expect(Result3).toEqual(Expected3)
})



test('Should align vartically param|property|return|throws if option set to true', () => {
  const options = {
    jsdocVerticalAlignment: true
  }
  const Result1 = subject(`/**
 * @property {Object} unalginedProp unaligned property descriptin
 * @param {String} unalginedParam unaligned param description
 * @returns {undefined}
 */`, options)
  const Expected1 = `/**
 * @property {Object}    unalginedProp  Unaligned property descriptin
 * @param    {String}    unalginedParam Unaligned param description
 * @return   {undefined}
 */
`

  const Result2 = subject(`/**
 * @throws {CustomExceptio} unaligned throws description
 * @returns {String} unaligned returns description
 */`, options)
  const Expected2 = `/**
 * @throws {CustomExceptio} Unaligned throws description
 * @return {String}         Unaligned returns description
 */
`

  expect(Result1).toEqual(Expected1)
  expect(Result2).toEqual(Expected2)
})

test('Should align vartically param|property|return|throws if option set to true, and amount of spaces is different than default', () => {
  const options1 = {
    jsdocVerticalAlignment: true,
    jsdocSpaces: 2
  }
  const unformattedJsdoc = `/**
 * @property {Object} unalginedProp unaligned property descriptin
 * @param {String} unalginedParam unaligned param description
 * @throws {CustomExceptio} unaligned throws description
 * @returns {undefined}
 */`
  const Result1 = subject(unformattedJsdoc, options1)
  const Expected1 = `/**
 * @property  {Object}          unalginedProp   Unaligned property descriptin
 * @throws    {CustomExceptio}                  Unaligned throws description
 * @param     {String}          unalginedParam  Unaligned param description
 * @return    {undefined}
 */
`

  const options2 = {
    jsdocVerticalAlignment: true,
    jsdocSpaces: 4
  }
  const Result2 = subject(`/**
 * @property {Object} unalginedProp unaligned property descriptin
 * @param {String} unalginedParam unaligned param description
 * @throws {CustomExceptio} unaligned throws description
 * @returns {String} unaligned returns description
 */`, options2)
  const Expected2 = `/**
 * @property    {Object}            unalginedProp     Unaligned property
 *                                                    descriptin
 * @throws      {CustomExceptio}                      Unaligned throws
 *                                                    description
 * @param       {String}            unalginedParam    Unaligned param
 *                                                    description
 * @return      {String}                              Unaligned returns
 *                                                    description
 */
`

  expect(Result1).toEqual(Expected1)
  expect(Result2).toEqual(Expected2)
})

test('Should insert proper amount of spaces based on option', () => {
  const options1 = {
    jsdocSpaces: 2
  }
  const Result1 = subject(`/**
 * @param {Object} paramName param description that goes on and on and on utill it will need to be wrapped
 * @returns {Number} return description
 */`, options1)
  const Expected1 = `/**
 * @param  {Object}  paramName  Param description that goes on and on and on
 *                              utill it will need to be wrapped
 * @return  {Number}  Return description
 */
`

  const options2 = {
    jsdocSpaces: 3
  }
  const Result2 = subject(`/**
 * @param {Object} paramName param description that goes on and on and on utill it will need to be wrapped
 * @returns {Number} return description
 */`, options2)
  const Expected2 = `/**
 * @param   {Object}   paramName   Param description that goes on and on and on
 *                                 utill it will need to be wrapped
 * @return   {Number}   Return description
 */
`

  expect(Result1).toEqual(Expected1)
  expect(Result2).toEqual(Expected2)
})

test('yields should work like return tag', () => {
  const options = {
    jsdocSpaces: 3
  }
  const Result1 = subject(`/**
 * @yields {Number} yields description
 */`, options)
  const Expected1 = `/**
 * @yields   {Number}   Yields description
 */
`
  const Result2 = subject(`/**
 * @yield {Number} yields description
 */`, options)
  const Expected2 = `/**
 * @yields   {Number}   Yields description
 */
`

  const Result3 = subject(`/**
 * @yield {Number}
 */`, options)
  const Expected3 = `/**
 * @yields   {Number}   TODO
 */
`

  const Result4 = subject(`/**
 * @yield yelds description
 */`, options)
  const Expected4 = `/**
 * @yields   Yelds description
 */
`

  const Result5 = subject(`/**
 * @yield
 */`, options)
  const Expected5 = `/**
 */
`

  expect(Result1).toEqual(Expected1)
  expect(Result2).toEqual(Expected2)
  expect(Result3).toEqual(Expected3)
  expect(Result4).toEqual(Expected4)
  expect(Result5).toEqual(Expected5)
})
