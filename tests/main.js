const prettier = require('prettier')
const path = require('path')
const fs = require('fs')
const cwd = process.cwd()
const code = fs.readFileSync(path.join(cwd, 'testFile.js'), { encoding: 'utf8' })
const doctrine = require('doctrine')

function parser(text, parsers, options) {
  const ast = parsers['babel-flow'](text)

  if (!options.jsdoc) options.jsdoc = { spaces: 1 }
  if (!options.jsdoc.spaces) options.jsdoc.spaces = 1

  function formatDescription(text) {
    text = text ? text.trim() : ''
    if (!text) return ''
    text = text[0].toUpperCase() + text.slice(1)   // Capitalize
    if (text[text.length - 1] !== '.') text += '.' // End with dot
    return text
  }

  function formatSpaces(textsList) {
    return textsList.join(' '.repeat(options.jsdoc.spaces)) + '\n'
  }

  ast.comments.forEach(comment => {
    if (comment.type !== 'CommentBlock') return

    const commentString = `/*${comment.value}*/`

    // Check if this comment block is a JSDoc.  Based on:
    // https://github.com/jsdoc/jsdoc/blob/master/packages/jsdoc/plugins/commentsOnly.js
    if (!commentString.match(/\/\*\*[\s\S]+?\*\//g)) return

    const parsed = doctrine.parse(commentString, { unwrap: true, sloppy: true })

    comment.value = '*\n'
    comment.value += formatSpaces(['* @description',  formatDescription(parsed.description) || 'TODO'])

    // Add empty line before tags
    if (parsed.tags.length) comment.value += '*\n'

    parsed.tags.forEach(tag => {
      tag.title = tag.title.toLowerCase()

      if (tag.title === 'returns') tag.title = 'return'
      if (tag.type.elements) tag.type.name = tag.type.elements.map(e => e.name).join('|')

      const parts = [`* @${tag.title}`, `{${tag.type.name}}`]
      if (tag.title !== 'return') parts.push(tag.name || 'TODO')
      parts.push(formatDescription(tag.description) || 'TODO')

      comment.value += formatSpaces(parts)
    })
  })

  return ast
}

test('test tests ;d', () => {
  console.log('------result:\n', prettier.format(code, { parser }))
})
