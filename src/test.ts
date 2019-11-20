import * as parser from '@babel/parser';
import { Node } from '@babel/traverse';
import {
  isNode,
  isIdentifier,
  isObjectProperty,
  isMemberExpression,
} from '@babel/types';

const code = `!(item.number_won === 0 && item.success_clock_in === 1 && fuck); test(shit, $event)`;
const code1 = `[fuck.a, 'test']`;
const code2 = `{a: item.number_won === 0, b: !(item.number_won === 0 && item.success_clock_in === 1 && fuck)}`;
const code3 = `$emit('pageClick', {button: artist, artist_id: starId.test.test})`;
const code4 = '`/stars/${starId}?entry=${entry}&entrypage=${entrypage}`';
const code5 = `getThumbUrl($sget(star, 'avatar'), 60 * 60, 60 * 60)`;
const codeList = [code, code1, code2, code3, code4, code5];
for (let i = 0; i < codeList.length; i++) {
  console.time('traverse');
  console.log(getVariable(preProcessCode(codeList[i])));
  console.timeEnd('traverse');
  console.log('------------------------');
}
function preProcessCode(code: string): Node {
  let normalizeCode = code.trim();
  let ast: Node;
  if (normalizeCode.startsWith('{')) {
    normalizeCode = `(${normalizeCode})`;
  }
  ast = parser.parse(normalizeCode);
  return ast;
}
function getVariable(ast: Node): string[] {
  const result: string[] = [];
  const nodeQueue: Node[] = [ast];
  const parentQueue: Node[] = [null];
  while (nodeQueue.length) {
    const cur = nodeQueue.shift();
    const parent = parentQueue.shift();
    if (cur.type === 'Identifier') {
      if (
        (isObjectProperty(parent) && parent.key === cur) ||
        (isMemberExpression(parent) && cur === parent.property)
      ) {
        continue;
      }
      result.push(cur.name);
    } else {
      const keys = Object.keys(cur);
      for (let i = 0; i < keys.length; i++) {
        const value = cur[keys[i]];
        if (Array.isArray(value)) {
          for (let j = 0; j < value.length; j++) {
            nodeQueue.push(value[j]);
            parentQueue.push(cur);
          }
        } else if (isNode(value)) {
          nodeQueue.push(value);
          parentQueue.push(cur);
          if (
            isIdentifier(value) &&
            cur.type !== 'CallExpression' &&
            cur.type !== 'ObjectProperty'
          ) {
            break;
          }
        }
      }
    }
  }
  return [...new Set(result)];
}
