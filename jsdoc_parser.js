const doctrine = require('doctrine')
const prettier = require('prettier')

// TODO This also could be taken from options.
const printWidth = 80

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
  text = text.replace(/\n/g, ' ')                // Make single line
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

        if (tag.type) {
          // Figure out tag.type.name
          if (!tag.type.name) {
            if (tag.type.expression) {
              tag.type.name = tag.type.expression.name
              tag.type.elements = tag.type.expression.elements
            }
            if (tag.type.elements) tag.type.name = tag.type.elements.map(e => e.name).join('|')
          }

          // Figure out tag.name if necessary
          if (tag.type.type === 'OptionalType') tag.name = `[${tag.name}]`
          // TODO At this point I should RegExp the hell out of
          // original string to find out if there is a default value
          // in tag.name.
        }

        if (tag.title !== 'example') tag.description = formatDescription(tag.description)
        if (!tag.description && !['example', 'private'].includes(tag.title)) tag.description = 'TODO.'

        return tag
      })

      // Sort tags
      .sort((a, b) => getTagOrderWeight(a.title) - getTagOrderWeight(b.title))

      // Create final jsDoc string
      .forEach((tag, tagIndex) => {
        let tagString = ` * @${tag.title}`

        if (tag.type && tag.type.name) tagString += gap + `{${tag.type.name}}`
        if (tag.name) tagString += gap + tag.name

        // Add description (complicated because of text wrap)
        if (tag.description && tag.title !== 'example') {
          tagString += gap
          const marginLength = tagString.length
          let description = tagString + tag.description
          tagString = ''

          while (description.length > printWidth) {
            const sliceIndex = description.lastIndexOf(' ', printWidth)
            tagString += description.slice(0, sliceIndex)
            description = description.slice(sliceIndex + 1, description.length)
            description = '\n *' + ' '.repeat(marginLength - 2) + description
          }

          if (description.length > marginLength) tagString += description
        }

        // Use prettier on @example tag description
        if (tag.title === 'example') {
          tagString += prettier.format(tag.description, options).replace(/(^|\n)/g, '\n *  ')
          tagString = tagString.slice(0, tagString.length - 5)
        }

        tagString += '\n'

        // Add empty line after @description or @example if there is something below
        if (['description', 'example'].includes(tag.title) && tagIndex !== parsed.tags.length - 1)
          tagString += ' *\n'

        comment.value += tagString
      })

    comment.value += ' '
  })

  return ast
}
