import { compile, ASTElement } from 'vue-template-compiler';
import * as fs from 'fs';
import * as path from 'path';
const template = fs.readFileSync(path.resolve(__dirname, './template.vue'));
const file = template.toString();
const result = compile(file);

const ret = traverse(result.ast, []);
console.log(ret);
function traverse(node: ASTElement | any, scope: string[]) {
  let result: Array<{}> = [];
  let children = node.children;

  const attrsMap: { [prop: string]: any } = {};
  if (node.alias) {
    scope.push(node.alias);
  }
  if (node.attrsMap) {
    let keys = Object.keys(node.attrsMap);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (key.startsWith(':') || key.startsWith('v-') || key.startsWith('@')) {
        attrsMap[key] = node.attrsMap[key];
      }
    }
    result.push(attrsMap);
  }

  if (children) {
    let len = children.length;
    for (let i = 0; i < len; i++) {
      result = result.concat(traverse(children[i], scope));
    }
  }
  if (node.alias) {
    scope.pop();
  }
  return result;
}

