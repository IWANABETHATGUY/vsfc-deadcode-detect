import { compile } from 'vue-template-compiler';
import * as fs from 'fs';
import * as path from 'path';
import { traverseTemplateAst } from './util/traverse';
import { getTemplateStatementVariable } from './parse/templateStatement';
const template = fs.readFileSync(path.resolve(__dirname, './template.vue'));
const file = template.toString();
const result = compile(file);
const ret = traverseTemplateAst(result.ast, []);
ret.forEach(attrMap => {
  const scope = attrMap['__scope__'];
  Object.keys(attrMap).forEach(key => {
    console.log(
      `${key}: ${attrMap[key]} ---> ${getTemplateStatementVariable(
        attrMap[key]
      ).filter(item => {
        return scope.indexOf(item) === -1;
      })}`
    );
  });
});
