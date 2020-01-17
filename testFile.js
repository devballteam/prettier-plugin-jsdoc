let foo = 1
const bar = 2

// one line comment

/**
 * jsDoc comment
 * @param {String} test - test description
 */

/** jsDoc comment 2 */

/* block comment in one line */

/*
block comment
in multiple lines
*/
/**
* @param {String|Null} some name
* @param {Number|Null} test
* @returns {Boolean} fe
*/

       function fun (/* comment inside code */)   {
/**
* another description
 * @description  Check if target contains value
 * @return  {Boolean}               True if found
* @private
 * @examples
 *   {{ 'Example string' | includes('ple') }} => true
 *   {{ ['foo', 'bar', 'baz'] | includes('boz') }} => false
 * @param   {String|Array}  target  Source
 * @param   {String}        value   Value you are looking for
 * @memberof  nunjucksEnv
*/
         function fun2 () {
         }
return true        // one line comment 2
}
