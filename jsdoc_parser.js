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
    text = text.replace(/\s\s+/g, ' ')             // Replace white characters with spaces
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

  function getTagOrderWeight(tagTitle) {
    var weightsMap = {
      'private': 1,
      'memberof': 2,
      'description': 3,
      'examples': 4,
      // Evertthing else will have 5
      'param': 6,
      // TODO Handle aliases like returns, examples etc.  Maybe I
      //      should prepare all titles before processing them.  Make
      //      them all lowercase, trim and avoid alliases.
      'returns': 7,
      'return': 7,
    }
    return weightsMap[tagTitle.trim().toLowerCase()] || 5
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

    if (parsed.description && !parsed.tags.find(t => t.title.toLowerCase() === 'description'))
      parsed.tags.push({ title: 'description', description: parsed.description })

    parsed.tags
      .sort((a, b) => getTagOrderWeight(a.title) - getTagOrderWeight(b.title))
      .forEach((tag, tagIndex) => {
        tag.title = tag.title.toLowerCase()

        if (tag.title === 'returns') tag.title = 'return'
        if (tag.title === 'examples') tag.title = 'example'
        if (tag.type && tag.type.elements) tag.type.name = tag.type.elements.map(e => e.name).join('|')

        const parts = [`* @${tag.title}`]
        if (tag.type) parts.push(`{${tag.type.name}}`)
        if (tag.name) parts.push(tag.name)

        // Warning!  Special case for @example
        if (tag.title === 'example') {
          parts[parts.length - 1] += `\n*\n${tag.description}\n*\n` // TODO WIP
        } else {
          parts.push(formatDescription(tag.description))
        }

        comment.value += formatLine(parts)

        // TODO Broken
        // Add empty line after description if there is something below
        if (tag.title === 'description' && tagIndex === parsed.tags.length - 1) comment.value += '*\n'
      })

    // comment.value is an end product of this whole operation
  })

  return ast
}
