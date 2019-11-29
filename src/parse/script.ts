import traverse, { NodePath, Node } from '@babel/traverse';
import { parse } from '@babel/parser';
import {
  ObjectMethod,
  ObjectExpression,
  ObjectProperty,
  SpreadElement,
  Identifier,
  isObjectExpression,
  isReturnStatement,
  isIdentifier,
  isObjectMethod,
  isObjectProperty,
  isExportDefaultDeclaration,
  isMemberExpression,
  isSpreadElement,
} from '@babel/types';
import { isLifeCircleFunction } from '../util/parse';

interface INodeDescription {
  name: string;
  start: number;
  end: number;
}

export function parseData(
  ast: ObjectMethod
): Array<ObjectMethod | ObjectProperty> {
  let objectExpression: ObjectExpression;
  traverse(ast, {
    ReturnStatement(path: NodePath) {
      const node = path.node;
      if (isReturnStatement(node) && isObjectExpression(node.argument)) {
        objectExpression = node.argument;
        path.stop();
      }
    },
    noScope: true,
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
): Array<ObjectMethod | SpreadElement | ObjectProperty> {
  return ast.properties.reduce(
    (pre: Array<ObjectMethod | SpreadElement | ObjectProperty>, property) => {
      pre.push(property);
      return pre;
    },
    []
  );
}

export function parseWatch(
  ast: ObjectExpression
): Array<ObjectMethod | ObjectProperty> {
  return ast.properties.reduce(
    (pre: Array<ObjectMethod | ObjectProperty>, property) => {
      if (
        property.type === 'ObjectMethod' ||
        property.type === 'ObjectProperty'
      ) {
        pre.push(property);
      }
      return pre;
    },
    []
  );
}

/**
 * 传入一个vue文件，或者一个js文件，返回默认导出的ObjectExpression ，如果发生错误或者没有默认导出返回null
 *
 * @export
 * @param {string} script
 * @returns {(ObjectExpression | null)}
 */
export function preProcess(script: string): ObjectExpression | null {
  const regex = /\<script\>([\s\S]+)\<\/script\>/;
  let content: string = script;
  let ret: RegExpExecArray;
  if ((ret = regex.exec(script))) {
    content = ret[1];
  }
  try {
    const ast = parse(content, { sourceType: 'module' });
    let objectExpression: ObjectExpression;

    traverse(ast, {
      ExportDefaultDeclaration(path: NodePath) {
        const node = path.node;
        if (
          isExportDefaultDeclaration(node) &&
          isObjectExpression(node.declaration)
        ) {
          objectExpression = node.declaration;
          path.stop();
        }
      },
    });
    return objectExpression || null;
  } catch (err) {
    return null;
  }
}

export class ScriptProcessor {
  private unusedNodeMap: Map<string, Node>;
  private usedNodeMap: Map<string, Node>;
  private unFoundNodeMap: Map<string, Set<string>>;
  private usedTokenSet: Set<string>;

  constructor(usedTokens: string[], sourceCode: string) {
    this.usedNodeMap = new Map<string, Node>();
    this.unusedNodeMap = new Map<string, Node>();
    this.usedTokenSet = new Set<string>(usedTokens);
    this.unFoundNodeMap = new Map<string, Set<string>>();
    const ast = preProcess(sourceCode);
    this.process(ast);
  }

  getUnusedNodeMap() {
    return this.unusedNodeMap;
  }

  getUnusedNodeDesc(): INodeDescription[] {
    const descriptionList: INodeDescription[] = [];
    this.unusedNodeMap.forEach((node, key) => {
      descriptionList.push({ start: node.start, end: node.end, name: key });
    });
    return descriptionList;
  }
  /**
   *
   *
   * @export
   * @param {string[]} usedToken  s 在template中使用的token列表
   */

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
          case 'computed':
            if (isObjectProperty(property)) {
              this.processMethods(property);
            }
            break;
          case 'watch':
            if (isObjectProperty(property)) {
              this.processWatch(property);
            }
            break;
          default:
            if (isLifeCircleFunction(property.key.name)) {
              if (isObjectMethod(property)) {
                this.processEffectMethod(property);
              }
            }
            break;
        }
      }
    });
    let flag: boolean;
    do {
      flag = false;
      this.unFoundNodeMap.forEach((set, key) => {
        if (this.unusedNodeMap.has(key)) {
          if (!set) {
            const unusedNode = this.unusedNodeMap.get(key);
            this.unusedNodeMap.delete(key);
            this.unFoundNodeMap.delete(key);
            this.usedNodeMap.set(key, unusedNode);
            flag = true;
          } else {
            for (let nodeName of set) {
              if (this.usedNodeMap.has(nodeName)) {
                const unusedNode = this.unusedNodeMap.get(key);
                this.unusedNodeMap.delete(key);
                this.unFoundNodeMap.delete(key);
                this.usedNodeMap.set(key, unusedNode);
                flag = true;
                break;
              }
            }
          }
        }
      });
    } while (flag);
  }

  processWatch(property: ObjectProperty) {
    if (isObjectExpression(property.value)) {
      const list = parseWatch(property.value);
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (isObjectMethod(item)) {
          this.processEffectMethod(item);
        } else if (isObjectExpression(item.value)) {
          for (const prop of item.value.properties) {
            if (isObjectMethod(prop) && prop.key.name === 'handler') {
              this.processEffectMethod(prop);
              break;
            }
          }
        }
      }
    }
  }

  processEffectMethod(property: ObjectMethod) {
    traverse(property, {
      ThisExpression: (path: NodePath) => {
        const parent = path.parent;
        if (!isMemberExpression(parent)) {
          return;
        }
        const node = parent.property;
        if (isIdentifier(node)) {
          this.unFoundNodeMap.set(node.name, null);
        }
      },
      noScope: true,
    });
  }

  processMethods(ast: ObjectProperty) {
    if (!isObjectExpression(ast.value)) {
      return;
    }
    const properties = parseMethods(ast.value);
    properties.forEach(property => {
      if (!isSpreadElement(property)) {
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

  markObjectMethodIdentifier(ast: ObjectProperty | ObjectMethod, used: boolean) {
    traverse(ast, {
      ThisExpression: (path: NodePath) => {
        const parent = path.parent;
        if (!isMemberExpression(parent)) {
          return;
        }
        const node = parent.property;
        if (isIdentifier(node)) {
          if (used && this.unusedNodeMap.has(node.name)) {
            const unusedNode = this.unusedNodeMap.get(node.name);
            this.unusedNodeMap.delete(node.name);
            this.usedNodeMap.set(node.name, unusedNode);
          } else {
            if (this.unFoundNodeMap.has(node.name)) {
              const set = this.unFoundNodeMap.get(node.name);
              if (set) {
                set.add(node.name);
              }
            } else {
              this.unFoundNodeMap.set(
                node.name,
                new Set([(<Identifier>ast.key).name])
              );
            }
          }
        }
      },
      noScope: true,
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
