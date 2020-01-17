const cwd = process.cwd();
const path = require('path');
const { parsers } = require('prettier/parser-babylon')
const printerEstree = require(path.join(cwd, 'node_modules/prettier-repo/src/language-js/printer-estree'))
const prettier = require('prettier')
const {
  doc: {
    builders: { concat, join, indent, group, hardline, softline, line }
  }
} = prettier

// console.log(printerEstree)

function jsdocPrinter (path, options, print) {
  const node = path.getValue()
  console.log('----------- node:', node)

  switch (node.type) {
  default:
    return ''
  }
}


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
    'jsdoc-parser': Object.assign(parsers['babel-flow'], {
      astFormat: "jsdoc-ast",
    })
  },
  printers: {
    // 'jsdoc-ast': printerEstree
    'jsdoc-ast': { print: jsdocPrinter }
  }
}

// var printerEstree = {
//   preprocess: preprocess_1$2,
//   print: genericPrint$3,
//   embed: embed_1$2,
//   insertPragma: insertPragma$7,
//   massageAstNode: clean_1$2,
//   hasPrettierIgnore: hasPrettierIgnore$2,
//   willPrintOwnComments: willPrintOwnComments,
//   canAttachComment: canAttachComment$1,
//   printComment: printComment$2,
//   isBlockComment: comments$3.isBlockComment,
//   handleComments: {
//     ownLine: comments$3.handleOwnLineComment,
//     endOfLine: comments$3.handleEndOfLineComment,
//     remaining: comments$3.handleRemainingComment
//   }
// };

