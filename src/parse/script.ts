import traverse, { NodePath, Node } from '@babel/traverse';
import { parse } from '@babel/parser';
import {
  ObjectMethod,
  ObjectExpression,
  ObjectProperty,
  SpreadElement,
  BlockStatement,
  isObjectExpression,
  isReturnStatement,
  isIdentifier,
  isObjectMethod,
  isObjectProperty,
  isExportDefaultDeclaration
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

export function parseMethods(
  ast: ObjectExpression
): Array<ObjectMethod | SpreadElement> {
  return ast.properties.reduce(
    (pre: Array<ObjectMethod | SpreadElement>, property) => {
      if (
        property.type === 'ObjectMethod' ||
        property.type === 'SpreadElement'
      ) {
        pre.push(property);
        return pre;
      }
    },
    []
  );
}

export class ScriptProcessor {
  private unusedNodeMap: Map<string, Node>;
  private usedNodeMap: Map<string, Node>;
  private unFoundNodeMap: Map<string, Set<Node>>;
  private usedTokenSet: Set<string>;

  constructor(usedTokens: string[], sourceCode: string) {
    this.usedNodeMap = new Map<string, Node>();
    this.unusedNodeMap = new Map<string, Node>();
    this.usedTokenSet = new Set<string>(usedTokens);
    this.unFoundNodeMap = new Map<string, Set<Node>>();
  }
  /**
   *
   *
   * @export
   * @param {string[]} usedToken  s 在template中使用的token列表
   */
  preProcess(script: string): ObjectExpression | null {
    const regex = /\<script\>([\s\S]+)\<\/script\>/;
    let content: string = script;
    let ret: RegExpExecArray;
    if ((ret = regex.exec(script))) {
      content = ret[1];
    }
    try {
      const ast = parse(content, {});
      let objectExpression: ObjectExpression;
      traverse(ast, {
        ExportDefaultDeclaration(path: NodePath) {
          const node = path.node;
          if (isExportDefaultDeclaration(node) && isObjectExpression(node.declaration)) {
            objectExpression = node.declaration;
            path.stop();
          }
        }
      })
      return objectExpression || null;
    } catch (err) {
      return null;
    }
  }
  process(ast: ObjectExpression) {
    ast.properties.forEach(property => {
      if (
        (isObjectMethod(property) || isObjectProperty(property)) &&
        isIdentifier(property.key)
      ) {
        switch (property.key.name) {
          case 'data':
            if (isObjectMethod(property)) {
              this.processData(property);
            }
            break;
          case 'props':
            if (isObjectProperty(property)) {
              this.processProps(property);
            }
            break;
          case 'methods':
            if (isObjectProperty(property)) {
              this.processMethods(property);
            }
            break;
          case 'computed':
            if (isObjectProperty(property)) {
              this.processMethods(property);
            }
            break;
          default:
            break;
        }
      }
    });
  }

  processMethods(ast: ObjectProperty) {
    if (!isObjectExpression(ast.value)) {
      return;
    }
    const properties = parseMethods(ast.value);
    properties.forEach(property => {
      if (isObjectMethod(property)) {
        let used = false;
        if (isIdentifier(property.key)) {
          if (this.usedTokenSet.has(property.key.name)) {
            used = true;
            this.usedNodeMap.set(property.key.name, property);
          } else {
            this.unusedNodeMap.set(property.key.name, property);
          }
        }
        this.markObjectMethodIdentifier(property, used);
      } else {
        if (isIdentifier(property.argument)) {
          if (this.usedTokenSet.has(property.argument.name)) {
            this.usedNodeMap.set(property.argument.name, property);
          } else {
            this.unusedNodeMap.set(property.argument.name, property);
          }
        }
      }
    });
  }

  markObjectMethodIdentifier(ast: ObjectMethod, used: boolean) {
    traverse(ast.body, {
      ThisExpression: (path: NodePath) => {
        const node = path.node;
        if (isIdentifier(node)) {
          if (used && this.unusedNodeMap.has(node.name)) {
            const unusedNode = this.unusedNodeMap.get(node.name);
            this.unusedNodeMap.delete(node.name);
            this.usedNodeMap.set(node.name, unusedNode);
          } else {
            this.unFoundNodeMap.set(node.name, new Set([ast]));
          }
        }
      },
    });
  }

  processProps(ast: ObjectProperty) {
    if (!isObjectExpression(ast.value)) {
      return;
    }
    const properties = parseProps(ast.value);
    this.markIdentifiers(properties);
  }

  processData(ast: ObjectMethod) {
    const properties = parseData(ast);
    this.markIdentifiers(properties);
  }

  markIdentifiers(properties: (ObjectMethod | ObjectProperty)[]) {
    for (let i = 0; i < properties.length; i++) {
      const key = properties[i].key;
      if (isIdentifier(key)) {
        const name = key.name;
        if (this.usedTokenSet.has(name)) {
          this.usedNodeMap.set(name, properties[i]);
        } else {
          this.unusedNodeMap.set(name, properties[i]);
        }
      }
    }
  }
}
