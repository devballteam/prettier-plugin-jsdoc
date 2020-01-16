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

function print(path, options, print) {
  const node = path.getValue()
  // console.log('----------- node:', node)

  switch (node.type) {
  default:
    return ''
  }
}

module.exports = {
  languages: [
    {
      extensions: ['.js'],
      name: 'jsdoc',
      parsers: ['jsdoc-parser']
    }
  ],
  parsers: {
    'jsdoc-parser': Object.assign(parsers['babel-flow'], {
      astFormat: "jsdoc-ast",
    })
  },
  printers: {
    'jsdoc-ast': printerEstree
  }
}
