// import resolve from '@rollup/plugin-node-resolve';
// import commonjs from 'rollup-plugin-commonjs';
// import sourceMaps from 'rollup-plugin-sourcemaps';
// import camelCase from 'lodash.camelcase';
// import typescript from 'rollup-plugin-typescript2';
// import json from 'rollup-plugin-json';

// const pkg = require('./package.json');

// const libraryName = 'vsfc-deadcode-detect';

// export default {
//   input: `src/index.ts`,
//   output: [
//     {
//       file: pkg.main,
//       name: camelCase(libraryName),
//       format: 'cjs',
//       sourcemap: true,
//     },
//     // { file: pkg.module, format: 'cjs', sourcemap: true },
//   ],
//   treeshake: false,
//   // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
//   external: [],
//   plugins: [
//     // Allow json resolution
//     // Compile TypeScript files
//     typescript({ useTsconfigDeclarationDir: true }),
//     resolve({
//       jsnext: true,
//       main: true,
//       preferBuiltins: true
//     }),
//     // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
//     commonjs({
//       include: 'node_modules/**',
//       namedExports: {
//         '@babel/types': [
//           ...new Set([
//             'isObjectProperty',
//             'isMemberExpression',
//             'isNode',
//             'isIdentifier',
//             'isObjectExpression',
//             'isReturnStatement',
//             'isExportDefaultDeclaration',
//             'isSpreadElement',
//             'isObjectMethod',
//             'isArrayExpression',
//             'isStringLiteral'
//           ]),
//         ],
//         'vue-template-compiler': ['compile', 'vue'],
//       }, // Default: undefined
//     }),
//     // Allow node_modules resolution, so you can use 'external' to control
//     // which external modules to include in the bundle
//     // https://github.com/rollup/rollup-plugin-node-resolve#usage

//     // Resolve source maps to the original source
//     sourceMaps(),
//   ],
// };



import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
// import { terser } from 'rollup-plugin-terser';
export default {
  input: 'src/index.ts', // our source file
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es', // the preferred format
    },
  ],
  exlucde: ['**/__test__/'],
  external: [...Object.keys(pkg.dependencies || {})],
  plugins: [
    typescript({
      typescript: require('typescript'),
    }),
    // terser(), // minifies generated bundles
  ],
};
