import traverse, { NodePath, Node } from '@babel/traverse';
import {
  ObjectMethod,
  isReturnStatement,
  ObjectExpression,
  isObjectExpression,
  ObjectProperty,
  isIdentifier,
} from '@babel/types';

export function parseData(
  ast: ObjectMethod
): Array<ObjectMethod | ObjectProperty> {
  let objectExpression: ObjectExpression;
  traverse(ast, {
    ReturnStatement(path: NodePath) {
      const node = path.node;
      if (isReturnStatement(node) && isObjectExpression(node.argument)) {
        objectExpression = node.argument;
      }
    },
  });
  if (isObjectExpression(objectExpression)) {
    return objectExpression.properties.reduce(
      (pre: Array<ObjectMethod | ObjectProperty>, property) => {
        if (
          property.type === 'ObjectMethod' ||
          property.type === 'ObjectProperty'
        ) {
          pre.push(property);
          return pre;
        }
      },
      []
    );
  }
  return [];
}

export function parseProps(ast: ObjectExpression): Array<ObjectProperty> {
  return ast.properties.reduce((pre: Array<ObjectProperty>, property) => {
    if (property.type === 'ObjectProperty') {
      pre.push(property);
      return pre;
    }
  }, []);
}

export function parseMethods(ast: ObjectExpression): Array<ObjectMethod> {
  return ast.properties.reduce((pre: Array<ObjectMethod>, property) => {
    if (property.type === 'ObjectMethod') {
      pre.push(property);
      return pre;
    }
  }, []);
}

function processData(
  ast: ObjectMethod,
  usedTokensSet: Set<string>,
  usedNodeMap: Map<string, Node>,
  unusedNodeMap: Map<string, Node>
) {
  const properties = parseData(ast);
  for (let i = 0; i < properties.length; i++) {
    const key = properties[i].key;
    if (isIdentifier(key)) {
      const name = key.name;
      if (usedTokensSet.has(name)) {
        usedNodeMap.set(name, properties[i]);
      } else {
        unusedNodeMap.set(name, properties[i]);
      }
    }
  }
}

class ScriptProcessor {
  private unusedNodeMap: Map<string, Node>;
  private usedNodeMap: Map<string, Node>;
  private usedTokenSet: Set<string>;
  constructor(usedTokens: string[], sourceCode: string) {
    this.usedNodeMap = new Map<string, Node>();
    this.unusedNodeMap = new Map<string, Node>();
    this.usedTokenSet = new Set<string>(usedTokens);
  }
  /**
   *
   *
   * @export
   * @param {string[]} usedToken  s 在template中使用的token列表
   */

  process(ast: ObjectExpression ) {
    processData(dataAstNode);
  }
}
