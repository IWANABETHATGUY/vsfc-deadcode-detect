import { compile } from 'vue-template-compiler';
import { traverseTemplateAst } from '../util/traverse';
import { getTemplateStatementVariable } from './templateStatement';

export function parseTemplate(code: string): string[] {
  const result = compile(code);
  const attrMapList = traverseTemplateAst(result.ast, []);
  const tokenList: string[] = [];
  for (let i = 0; i < attrMapList.length; i++) {
    const attrMap = attrMapList[i];
    try {
      const scope = attrMap['__scope__'];
      const temTokenList = Object.keys(attrMap).reduce((pre: string[], cur) => {
        return pre.concat(
          ...(getTemplateStatementVariable(attrMap[cur]).filter(item => {
            return scope.indexOf(item) === -1;
          }))
        );
      }, [])
      tokenList.push(...temTokenList);
    } catch (err) {
      console.log(attrMap)
    }
  }
  return [...new Set(tokenList)];
}
