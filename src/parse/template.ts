import { compile } from 'vue-template-compiler';
import { traverseTemplateAst } from '../util/traverse';
import { getTemplateStatementVariable } from './templateStatement';

export function parseTemplate(code: string): string[] {
  const result = compile(code);
  const attrMapList = traverseTemplateAst(result.ast, []);
  return [
    ...new Set(
      <string[]>attrMapList.reduce((tokenList: string[], attrMap) => {
        const scope = attrMap['__scope__'];
        return tokenList.concat(
          ...Object.keys(attrMap).reduce((pre: string[], cur) => {
            return pre.concat(
              ...getTemplateStatementVariable(attrMap[cur]).filter(item => {
                return scope.indexOf(item) === -1;
              })
            );
          }, [])
        );
      }, [])
    ),
  ];
}
