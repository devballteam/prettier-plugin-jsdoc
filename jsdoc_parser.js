const doctrine = require('doctrine')

/** {@link https://prettier.io/docs/en/api.html#custom-parser-api} */
module.exports = function jsdocParser(text, parsers, options) {
  const ast = parsers['babel-flow'](text)

  if (!options.jsdoc) options.jsdoc = { spaces: 1 }
  if (!options.jsdoc.spaces) options.jsdoc.spaces = 1

  /**
   * Trim, make single line with capitalized text and dot at the end.
   * Return 'TODO' if description is empty.
   * @param {String} text
   * @return {String}
   */
  function formatDescription(text) {
    text = text ? text.trim() : ''
    if (!text) return 'TODO'
    text = text.replace(/\s\s+/g, ' ')             // Avoid multiple spaces and \n
    text = text[0].toUpperCase() + text.slice(1)   // Capitalize
    if (text[text.length - 1] !== '.') text += '.' // End with dot
    return text || 'TODO'
  }

  /**
   * Format line by adding spaces (options.jsdoc.spaces) between
   * textList elements and new line at the end.
   * @param {Array} textsList
   * @return {String}
   */
  function formatLine(textsList) {
    return textsList.join(' '.repeat(options.jsdoc.spaces)) + '\n'
  }

  ast.comments.forEach(comment => {
    // Parse only comment blocks
    if (comment.type !== 'CommentBlock') return

    const commentString = `/*${comment.value}*/`

    // Check if this comment block is a JSDoc.  Based on:
    // https://github.com/jsdoc/jsdoc/blob/master/packages/jsdoc/plugins/commentsOnly.js
    if (!commentString.match(/\/\*\*[\s\S]+?\*\//g)) return

    const parsed = doctrine.parse(commentString, { unwrap: true, sloppy: true })

    comment.value = '*\n'
    comment.value += formatLine(['* @description',  formatDescription(parsed.description)])

    // Add empty line before tags
    if (parsed.tags.length) comment.value += '*\n'

    parsed.tags.forEach(tag => {
      tag.title = tag.title.toLowerCase()

      if (tag.title === 'returns') tag.title = 'return'
      if (tag.type && tag.type.elements) tag.type.name = tag.type.elements.map(e => e.name).join('|')

      const parts = [`* @${tag.title}`]
      if (tag.type) parts.push(`{${tag.type.name}}`)
      if (tag.title !== 'return') parts.push(tag.name || 'TODO')
      parts.push(formatDescription(tag.description))

      comment.value += formatLine(parts)
    })

    // comment.value is an end product of this whole operation
  })

  return ast
}
