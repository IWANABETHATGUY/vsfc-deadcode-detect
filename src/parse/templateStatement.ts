import * as parser from '@babel/parser';
import { Node } from '@babel/traverse';
import {
  isObjectProperty,
  isMemberExpression,
  isNode,
  isIdentifier,
  isThisExpression,
  Identifier,
} from '@babel/types';

function preProcessCode(code: string): Node {
  let normalizeCode = code.trim();
  let ast: Node;
  if (normalizeCode.startsWith('{')) {
    normalizeCode = `(${normalizeCode})`;
  }
  // eslint-disable-next-line prefer-const
  ast = parser.parse(normalizeCode);
  return ast;
}

// TODO: 这个改动有待观察
function notFirstLevelIdentifier(cur: Identifier, parent: Node) {
  return (
    (isObjectProperty(parent) && parent.key === cur && !parent.computed) ||
    (isMemberExpression(parent) &&
      cur === parent.property &&
      !parent.computed &&
      !isThisExpression(parent.object))
  );
}


export function getVariable(ast: Node): string[] {
  const result: string[] = [];
  const nodeQueue: Node[] = [ast];
  const parentQueue: Node[] = [null];
  while (nodeQueue.length) {
    const cur = nodeQueue.shift();
    const parent = parentQueue.shift();
    if (cur.type === 'Identifier') {
      if (notFirstLevelIdentifier(cur, parent)) {
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
            cur.type !== 'NewExpression' &&
            cur.type !== 'ConditionalExpression' &&
            cur.type !== 'ObjectProperty' &&
            cur.type !== 'LogicalExpression' &&
            cur.type !== 'BinaryExpression' &&
            cur.type !== 'AssignmentExpression'
          ) {
            if (isMemberExpression(cur)) {
              if (cur.computed || isThisExpression(cur.object)) {
                continue;
              }
            }
            break;
          }
        }
      }
    }
  }
  return [...new Set(result)];
}

// const code2 = ` ({a: item.number_won === 0, b: !(item.number_won === 0 && item.success_clock_in === 1 && fuck)})`;
export function getTemplateStatementVariable(code: string): string[] {
  try {
    return getVariable(preProcessCode(code));
  } catch {
    console.log(code);
    return [];
  }
}




