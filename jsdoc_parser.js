const doctrine = require('doctrine')
const prettier = require('prettier')
const babelFlow = require('prettier/parser-babylon').parsers['babel-flow']

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
 * Trim, make single line with capitalized text
 * @param {String} text
 * @return {String}
 */
function formatDescription(text) {
  text = text ? text.trim() : ''
  if (!text) return ''
  text = text.replace(/\s\s+/g, ' ')             // Avoid multiple spaces
  text = text.replace(/\n/g, ' ')                // Make single line
  text = text[0].toUpperCase() + text.slice(1)   // Capitalize
  return text || ''
}

/** {@link https://prettier.io/docs/en/api.html#custom-parser-api} */
function jsdocParser(text, parsers, options) {
  const ast = parsers['babel-flow'](text)

  // Options
  const gap = ' '.repeat(options.jsdocSpaces)
  const printWidth = options.jsdocPrintWidth

  /**
   * Control order of tags by weights.  Smaller value brings tag higher.
   * @param {String} tagTitle
   * @return {Number} Tag weight
   */
  function getTagOrderWeight(tagTitle) {
    const index = options.jsdocTagsOrder.indexOf(tagTitle)
    return index === -1 ? (options.jsdocTagsOrder.indexOf('other') || 0) : index
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
            if (tag.type.elements) {
              tag.type.name = tag.type.elements.map(e => {
                const typeNameMap = {
                  'UndefinedLiteral': 'undefined',
                  'NullLiteral': 'null',
                }
                return typeNameMap[e.type] || e.name || 'undefined'
              }).join('|')
            }
          }

          // Additional operations on tag.name
          if (tag.name) {
            // Figure out if tag type have default value
            const part = commentString.split(new RegExp(`@.+{.+}.+${tag.name}\s?=\s?`))[1]
            if (part) tag.name = tag.name + '=' + part.split(/\s/)[0].replace(']', '')

            // Optional tag name
            if (tag.type.type === 'OptionalType') tag.name = `[${tag.name}]`
          }
        }

        if (['description', 'param', 'return', 'todo'].includes(tag.title))
          tag.description = formatDescription(tag.description)

        if (!tag.description && ['description', 'param', 'return', 'todo', 'memberof'].includes(tag.title))
          tag.description = 'TODO'

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

          if (['memberof', 'see'].includes(tag.title)) { // Avoid wrapping
            tagString += tag.description
          } else { // Wrap tag description
            const marginLength = tagString.length
            let maxWidth = printWidth
            if (marginLength >= maxWidth) maxWidth = marginLength + 40
            let description = tagString + tag.description
            tagString = ''

            while (description.length > maxWidth) {
              let sliceIndex = description.lastIndexOf(' ', maxWidth)
              if (sliceIndex === -1 || sliceIndex <= marginLength + 2) sliceIndex = maxWidth
              tagString += description.slice(0, sliceIndex)
              description = description.slice(sliceIndex + 1, description.length)
              description = '\n *' + ' '.repeat(marginLength - 2) + description
            }

            if (description.length > marginLength) tagString += description
          }
        }

        // Try to use prettier on @example tag description
        if (tag.title === 'example') {
          try {
            const formatedDescription = prettier.format(tag.description, options)
            tagString += formatedDescription.replace(/(^|\n)/g, '\n *   ')
            tagString = tagString.slice(0, tagString.length - 6)
          } catch (err) {
            tagString += '\n' + tag.description.split('\n').map(l => ' *   ' + l.trim()).join('\n')
          }
        }

        tagString += '\n'

        // Add empty line after some tags if there is something below
        if (['description', 'example', 'todo'].includes(tag.title) && tagIndex !== parsed.tags.length - 1)
          tagString += ' *\n'

        comment.value += tagString
      })

    comment.value += ' '
  })

  return ast
}

// jsdoc-parser
module.exports = {
  languages: [{
    name: 'JavaScript',
    parsers: ['jsdoc-parser'],
  }],
  parsers: {
    'jsdoc-parser': Object.assign({}, babelFlow, { parse: jsdocParser })
  },
  // How to define options: https://github.com/prettier/prettier/blob/master/src/cli/constant.js#L16
  // Issue with string type: https://github.com/prettier/prettier/issues/6151
  options: {
    jsdocSpaces: {
      type: 'int',
      category: 'jsdoc',
      default: 1,
      description: 'How many spaces will be used to separate tag elements.',
    },
    jsdocPrintWidth: {
      type: 'int',
      category: 'jsdoc',
      default: 80,
      description: 'After how many characters description text should be wrapped.',
    },
    jsdocTagsOrder: {
      type: 'path',
      category: 'jsdoc',
      array: true, // Fancy way to get option in array form
      default: [{ value: [
        'private',
        'global',
        'class',
        'memberof',
        'namespace',
        'callback',
        'description',
        'see',
        'todo',
        'examples',
        'other',
        'param',
        'return',
      ]}],
      description: 'Define order of tags.',
    }
  },
  defaultOptions: {
    jsdocSpaces: 1,
    jsdocPrintWidth: 80,
  }
}
