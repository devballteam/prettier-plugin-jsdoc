const doctrine = require('doctrine')

const tagSynonyms = {
  // One TAG TYPE can have different titles called SYNONYMS.  We want
  // to avoid different titles in the same tag so here is map with
  // synonyms as keys and tag type as value that we want to have in
  // final jsDoc.
  'virtual'      : 'abstract',
  'extends'      : 'augments',
  'constructor'  : 'class',
  'const'        : 'constant',
  'defaultvalue' : 'default',
  'desc'         : 'description',
  'host'         : 'external',
  'fileoverview' : 'file',
  'overview'     : 'file',
  'emits'        : 'fires',
  'func'         : 'function',
  'method'       : 'function',
  'var'          : 'member',
  'arg'          : 'param',
  'argument'     : 'param',
  'prop'         : 'property',
  'returns'      : 'return',
  'exception'    : 'throws',
  'yield'        : 'yields',

  // {@link} (synonyms: {@linkcode}, {@linkplain})
  // TODO I'm not sure how @link is parsed.  I will have to look up
  //      that later.  It's not important for my because in our
  //      projects we don't use @link.  Or maybe we are?

  // It looks like sometimes someone use incorrect tag title.  Its
  // close to correct title but not quite.  We want to map that too.
  'examples'     : 'example',
  'params'       : 'param',
}

/**
 * Trim, make single line with capitalized text and dot at the end.
 * @param {String} text
 * @return {String}
 */
function formatDescription(text) {
  text = text ? text.trim() : ''
  if (!text) return ''
  text = text.replace(/\s\s+/g, ' ')             // Avoid multiple spaces
  text = text.replace('\n', ' ')                 // Make single line
  text = text[0].toUpperCase() + text.slice(1)   // Capitalize
  if (text[text.length - 1] !== '.') text += '.' // End with dot
  return text || ''
}

function getTagOrderWeight(tagTitle) {
  var tagsWeightMap = {
    'private'     : 1,
    'memberof'    : 2,
    'description' : 3,
    'examples'    : 4,
    // Evertthing else will have 5
    'param'       : 6,
    'return'      : 7,
  }
  return tagsWeightMap[tagTitle] || 5
}

/** {@link https://prettier.io/docs/en/api.html#custom-parser-api} */
module.exports = function jsdocParser(text, parsers, options) {
  const ast = parsers['babel-flow'](text)

  if (!options.jsdoc) options.jsdoc = { spaces: 1 }
  if (!options.jsdoc.spaces) options.jsdoc.spaces = 1

  const gap = ' '.repeat(options.jsdoc.spaces)

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

      // Prepare tags data
      .map(tag => {
        tag.title = tag.title.trim().toLowerCase()
        tag.title = tagSynonyms[tag.title] || tag.title

        // TODO check how types are parsed if default value is passed
        if (tag.type) {
          if (tag.type.expression) tag.type.elements = tag.type.expression.elements
          if (tag.type.elements) tag.type.name = tag.type.elements.map(e => e.name).join('|')
          if (tag.type.type === 'OptionalType') tag.name = `[${tag.name}]`
        }

        if (tag.title !== 'example') tag.description = formatDescription(tag.description)
        if (!tag.description && tag.title !== 'private') tag.description = 'TODO'

        return tag
      })

      // Sort tags
      .sort((a, b) => getTagOrderWeight(a.title) - getTagOrderWeight(b.title))

      // Create final jsDoc string
      .forEach((tag, tagIndex) => {
        comment.value += ` * @${tag.title}`

        if (tag.type && tag.type.name) comment.value += gap + `{${tag.type.name}}`
        if (tag.name) comment.value += gap + tag.name
        // TODO Wrap long description lines.  This might be tricky.
        if (tag.description && tag.title !== 'example') comment.value += gap + tag.description

        comment.value += '\n'

        // Handle @example tag description in special way
        if (tag.title === 'example') {
          // console.log('>>>> example tag.description', tag.description)
          comment.value += `${tag.description}\n` // TODO WIP
        }

        // Add empty line after @description or @example if there is something below
        if (['description', 'example'].includes(tag.title) && tagIndex !== parsed.tags.length - 1)
          comment.value += ' *\n'
      })

    comment.value += ' '
  })

  return ast
}
