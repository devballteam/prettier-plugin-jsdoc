const cwd = process.cwd()
const path = require('path')
const prettier = require('prettier')
// const {
//   doc: {
//     builders: { concat, join, indent, group, hardline, softline, line }
//   }
// } = prettier

// [x] languages
// [x] parsers
// [x] printers
// [ ] options
// [ ] defaultOptions

module.exports = {
  languages: [
    {
      name: 'jsdoc',
      extensions: ['.js'],
      parsers: ['jsdoc-parser']
    }
  ],
  parsers: {
    "jsdoc-parser": {
      // text: string, parsers: object, options: object
      parse (text, parsers, options) {
        const babelFlowAST = parsers['babel-flow'](text, parsers, options)

        babelFlowAST.comments.forEach(comment => {
          if (comment.type === 'CommentBlock') {
            console.log('>>>> value', '/*' + comment.value + '*/')
          }
        })
      },
      astFormat: "jsdoc-ast",
      // hasPragma, locStart, locEnd, preprocess,
    }
  },
  printers: {
    'jsdoc-ast': {
      // preprocess,
      print (path, options, print) {
        const node = path.getValue()
        console.log('----------- node:', node)

        switch (node.type) {
        default:
          return ''
        }
      },
      // embed, insertPragma, massageAstNode, hasPrettierIgnore, willPrintOwnComments, canAttachComment, printComment, isBlockComment,
      // handleComments: { ownLine, endOfLine, remaining }
    }
  }
}

