import traverse, { NodePath, Node, Scope } from '@babel/traverse';
import { parse } from '@babel/parser';
import { DetectOptions } from '../index';
import {
  ObjectMethod,
  ObjectExpression,
  ObjectProperty,
  SpreadElement,
  ArrayExpression,
  StringLiteral,
  isObjectExpression,
  isReturnStatement,
  isIdentifier,
  isObjectMethod,
  isObjectProperty,
  isExportDefaultDeclaration,
  isMemberExpression,
  isSpreadElement,
  isArrayExpression,
  isStringLiteral,
  isFunctionExpression,
  FunctionExpression,
  isThisExpression,
  isVariableDeclarator,
  MemberExpression,
} from '@babel/types';
import { isLifeCircleFunction, isNuxtConfigFunction } from '../util/parse';

export interface NodeDescription {
  name: string;
  start: number;
  end: number;
  loc: {
    start: {
      line: number;
      column: number;
    };
    end: {
      line: number;
      column: number;
    };
  };
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
export function preProcess(
  script: string
): [ObjectExpression | null, number, number] {
  const regex = /<script>([\s\S]+)<\/script>/;
  let content: string = script;
  let offset = 8;
  let ret: RegExpExecArray;
  if ((ret = regex.exec(script))) {
    content = ret[1];
    offset += ret.index;
  }
  const line = script.slice(0, offset).split('\n').length - 1;
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
    return [objectExpression || null, offset, line];
  } catch (err) {
    return [null, 0, 0];
  }
}

export class ScriptProcessor {
  private unusedNodeMap: Map<
    string,
    ObjectProperty | ObjectMethod | StringLiteral
  >;
  private usedNodeMap: Map<string, Node>;
  private unFoundNodeMap: Map<string, Set<string>>;
  private usedTokenSet: Set<string>;
  private offset: number;
  private line: number;
  constructor(
    usedTokens: string[],
    sourceCode: string,
    options: DetectOptions = { nuxt: false }
  ) {
    this.usedNodeMap = new Map<string, Node>();
    this.unusedNodeMap = new Map<
      string,
      ObjectProperty | ObjectMethod | StringLiteral
    >();
    this.usedTokenSet = new Set<string>(usedTokens);
    this.unFoundNodeMap = new Map<string, Set<string>>();
    const [ast, offset, line] = preProcess(sourceCode);
    this.line = line;
    this.offset = offset;
    this.process(ast, options.nuxt);
  }

  getUnusedNodeMap(): Map<string, ObjectProperty | ObjectMethod | StringLiteral> {
    return this.unusedNodeMap;
  }

  getUnusedNodeDesc(): NodeDescription[] {
    const offset = this.offset;
    const descriptionList: NodeDescription[] = [];
    this.unusedNodeMap.forEach((node, key) => {
      descriptionList.push({
        start: node.start + offset,
        end: node.end + offset,
        name: key,
        loc: {
          start: {
            line: node.loc.start.line + this.line,
            column: node.loc.start.column,
          },
          end: {
            line: node.loc.end.line + this.line,
            column: node.loc.end.column,
          },
        },
      });
    });
    return descriptionList;
  }
  /**
   *
   *
   * @export
   * @param {string[]} usedToken  s 在template中使用的token列表
   */

  process(ast: ObjectExpression, nuxt: boolean) {
    if (ast === null) {
      console.warn(`parse error`);
      return;
    }
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
            if (
              nuxt &&
              isNuxtConfigFunction(property.key.name) &&
              isObjectMethod(property)
            ) {
              this.processEffectMethod(property);
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
            for (const nodeName of set) {
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
        if (isIdentifier(item.key)) {
          this.unFoundNodeMap.set(item.key.name, null);
        }
        if (isObjectMethod(item)) {
          this.processEffectMethod(item);
        } else if (isObjectExpression(item.value)) {
          for (const prop of item.value.properties) {
            if (isObjectMethod(prop) && prop.key.name === 'handler') {
              this.processEffectMethod(prop);
              break;
            } else if (
              isObjectProperty(prop) &&
              isFunctionExpression(prop.value)
            ) {
              this.processEffectMethod(prop.value);
              break;
            }
          }
        }
      }
    }
  }

  processEffectMethod(property: ObjectMethod | FunctionExpression) {
    const scopeSet = new Set<Scope>();
    traverse(property, {
      ThisExpression: (path: NodePath) => {
        this.markDestructThisExpression(path);
        if (!scopeSet.has(path.scope)) {
          scopeSet.add(path.scope);
          this.markScope(path.scope, true, '', true);
        }
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
      }
      // else {
      //   if (isIdentifier(property.argument)) {
      //     if (this.usedTokenSet.has(property.argument.name)) {
      //       this.usedNodeMap.set(property.argument.name, property);
      //     } else {
      //       this.unusedNodeMap.set(property.argument.name, property);
      //     }
      //   }
      // }
    });
  }

  markObjectMethodIdentifier(
    ast: ObjectProperty | ObjectMethod,
    used: boolean
  ) {
    if (!isIdentifier(ast.key) || ast.computed) {
      return;
    }
    const scopeSet = new Set<Scope>();
    const name = ast.key.name;
    traverse(ast, {
      ThisExpression: (path: NodePath) => {
        this.markDestructThisExpression(path, false, used, name);
        if (!scopeSet.has(path.scope)) {
          scopeSet.add(path.scope);
          this.markScope(path.scope, used, name);
        }
        const parent = path.parent;
        if (!isMemberExpression(parent)) {
          return;
        }
        this.markMemberExpression(parent, used, name);
        // this.markThisExpression(, used, ast.key.name);
      },
      noScope: true,
    });
  }

  /**
   * marked MemberExpression 当object 是this
   *
   * @param {MemberExpression} parent
   * @param {boolean} used
   * @param {string} name
   *
   * @memberOf ScriptProcessor
   */
  markMemberExpression(parent: MemberExpression, used: boolean, name: string) {
    const property = parent.property;
    const computed = parent.computed;
    if (isStringLiteral(property)) {
      this.markThisExpression(property.value, used, name);
    } else if (isIdentifier(property) && !computed) {
      this.markThisExpression(property.name, used, name);
    }
  }
  markScope(
    scope: Scope,
    used: boolean,
    key: string,
    ignoreCondition = false
  ) {
    const bindings = scope.bindings;
    Object.keys(bindings).forEach(bindingkey => {
      const node = bindings[bindingkey].path.node;
      if (isVariableDeclarator(node) && isThisExpression(node.init)) {
        bindings[bindingkey].referencePaths.forEach(refPath => {
          const refNode = refPath.node;
          const refParent = refPath.parent;
          if (isIdentifier(refNode) && isMemberExpression(refParent)) {
            if (ignoreCondition) {
              if (isStringLiteral(refParent.property)) {
                this.unFoundNodeMap.set(refParent.property.value, null);
              } else if (
                isIdentifier(refParent.property) &&
                !refParent.computed
              ) {
                this.unFoundNodeMap.set(refParent.property.name, null);
              }
            } else {
              this.markMemberExpression(refParent, used, key);
            }
            // const property = refPath.parent.property;
            // const computed = refPath.parent.computed;
            // if (isStringLiteral(property)) {
            //   this.markThisExpression(property.value, used, key);
            // } else if (isIdentifier(property) && !computed) {
            //   this.markThisExpression(property.name, used, key);
            // }
          }
        });
      }
    });
  }
  /**
   *
   *
   * @param {string} name 代表MemberExpression 中的property是 Stringliteral 或者Identifier 时的值
   * @param {boolean} used
   * @param {string} key 代表指向该 变量 的ObjectExpression 或者ObjectMethod 的key.name
   *
   * @memberOf ScriptProcessor
   */
  markThisExpression(name: string, used: boolean, key: string) {
    if (used && this.unusedNodeMap.has(name)) {
      const unusedNode = this.unusedNodeMap.get(name);
      this.unusedNodeMap.delete(name);
      this.usedNodeMap.set(name, unusedNode);
    } else {
      if (this.unFoundNodeMap.has(name)) {
        const set = this.unFoundNodeMap.get(name);
        if (set) {
          set.add(key);
        }
      } else {
        this.unFoundNodeMap.set(name, new Set([key]));
      }
    }
  }
  processProps(ast: ObjectProperty) {
    if (isObjectExpression(ast.value)) {
      const properties = parseProps(ast.value);
      this.markIdentifiers(properties);
    } else if (isArrayExpression(ast.value)) {
      this.markArrayExpression(ast.value);
    }
  }

  processData(ast: ObjectMethod) {
    const properties = parseData(ast);
    this.markIdentifiers(properties, true);
  }

  markArrayExpression(array: ArrayExpression) {
    array.elements.forEach(item => {
      if (isStringLiteral(item)) {
        if (this.usedTokenSet.has(item.value)) {
          this.usedNodeMap.set(item.value, item);
        } else {
          this.unusedNodeMap.set(item.value, item);
        }
      }
    });
  }

  markIdentifiers(
    properties: (ObjectMethod | ObjectProperty)[],
    needTraverse = false
  ) {
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const key = property.key;
      if (isIdentifier(key)) {
        const name = key.name;
        if (this.usedTokenSet.has(name)) {
          this.usedNodeMap.set(name, property);
        } else {
          this.unusedNodeMap.set(name, property);
        }
        if (needTraverse) {
          this.markObjectMethodIdentifier(property, false);
        }
      }
    }
  }
  // 标记 VariableDeclarator 当 左值是一个objectPattern 当右值是ThisExpression
  markDestructThisExpression(
    path: NodePath,
    effect = true,
    used = false,
    name = ''
  ) {
    if (
      path.parent.type === 'VariableDeclarator' &&
      path.parent.id.type === 'ObjectPattern'
    ) {
      const objectPattern = path.parent.id;
      objectPattern.properties.forEach(property => {
        if (isObjectProperty(property)) {
          if (
            isIdentifier(property.key) &&
            !this.usedTokenSet.has(property.key.name)
          ) {
            // this.markThisExpression(property.key.name, true, name)
            if (effect) {
              this.unFoundNodeMap.set(property.key.name, null);
            } else {
              this.markThisExpression(property.key.name, used, name);
            }
          }
        }
      });
    }
  }
}
