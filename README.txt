
PRETTIER PLUGIN JSDOC

        This is for of original repository: https://gitlab.com/gumen/prettier-plugin-jsdoc
        with changed parser to have possibility to use it with TypeScript.

        Prettire plugin that extends "typescript" parser with
        parser for JSDoc comments.

        Author      : @gumen
        Contributor : @VectorW, @mbogatzki

INSTALLATION

        1. Install and configure Prettier as usual
        2. Run $ npm i --save-dev https://gitlab.com/gumen/prettier-plugin-jsdoc.git
        3. Set "parser" value in Prettier options to "jsdoc-parser"

OPTIONS

        KEY                                 TYPE     DEFAULT

        jsdocSpaces                         Number   1
        jsdocPrintWidth                     Number   80
        jsdocDescriptionWithDot             Boolean  false
        jsdocDescriptionTag                 Boolean  false
        jsdocVerticalAlignment              Boolean  true
        jsdocUnionTypeParentheses           Boolean  false
        jsdocKeepUnparseableExampleIndent   Boolean  true

        Full up to date list and description of options can be found
        in Prettier help.  First install plugin then run Prettier with
        "--help" option.

        $ prettier --help                      # global installation
        $ ./node_modules/.bin/prettier --help  # local installation


LINKS

        Prettier : https://prettier.io
        JSDoc    : https://jsdoc.app
