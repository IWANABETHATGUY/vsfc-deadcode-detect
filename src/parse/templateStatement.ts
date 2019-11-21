import * as parser from '@babel/parser';
import { Node } from '@babel/traverse';
import {
  isNode,
  isIdentifier,
  isObjectProperty,
  isMemberExpression,
} from '@babel/types';

// const code2 = `({a: item.number_won === 0, b: !(item.number_won === 0 && item.success_clock_in === 1 && fuck)})`;
export function getTemplateStatementVariable(code: string): string[] {
  return getVariable(preProcessCode(code));
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
export function getVariable(ast: Node): string[] {
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
            cur.type !== 'ConditionalExpression' &&
            cur.type !== 'ObjectProperty' &&
            cur.type !== 'LogicalExpression' &&
            cur.type !== 'BinaryExpression'
          ) {
            break;
          }
        }
      }
    }
  }
  return [...new Set(result)];
}
