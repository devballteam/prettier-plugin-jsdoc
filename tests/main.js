const prettier = require('prettier')
const path = require('path')
const fs = require('fs')
const cwd = process.cwd()
const code = fs.readFileSync(path.join(cwd, 'testFile.js'), { encoding: 'utf8' })
const doctrine = require('doctrine')

test('test tests ;d', () => {
  console.log('------result:\n', prettier.format(code, {
    parser(text, parsers) {
      const ast = parsers['babel-flow'](text);

      ast.comments.forEach(comment => {
        // Based on https://github.com/jsdoc/jsdoc/blob/master/packages/jsdoc/plugins/commentsOnly.js
        const commentString = `/*${comment.value}*/`
        const isDocComment = commentString.match(/\/\*\*[\s\S]+?\*\//g)

        // Ignore comment lines and comment block that are not jsDoc
        if (comment.type !== 'CommentBlock' || !isDocComment) return
        const parsed = doctrine.parse(commentString, { unwrap: true })

        // TODO capitalize every description
        // TODO add dot at the end
        comment.value = '*\n'
        comment.value += `* @description  ${parsed.description}\n`

        parsed.tags.forEach(tag => {
          comment.value += `* @${tag.title}  {${tag.type.name}}  ${tag.name}  ${tag.description}\n`
        })
      })

      return ast;
    }
  }))
})
