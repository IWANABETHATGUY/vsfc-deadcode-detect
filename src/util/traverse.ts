import { ASTElement } from 'vue-template-compiler';
export function traverseTemplateAst(
  node: ASTElement | any,
  scope: string[]
): Array<{ [prop: string]: any }> {
  let result: Array<{}> = [];
  let children = node.children;

  if (node.alias) {
    scope.push(node.alias);
  }
  if (node.iterator1) {
    scope.push(node.iterator1);
  }
  if (node.attrsMap) {
    const attrsMap: { [prop: string]: any } = {};
    let keys = Object.keys(node.attrsMap);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (key.startsWith(':') || key.startsWith('v-') || key.startsWith('@')) {
        attrsMap[key] = node.attrsMap[key];
      }
    }
    Object.defineProperty(attrsMap, '__scope__', {
      enumerable: false,
      value: [...scope],
    });
    result.push(attrsMap);
  } else if (node.type === 2) {
    const attrsMap = { __text__: node.text.trim().slice(2, -2) };
    Object.defineProperty(attrsMap, '__scope__', {
      enumerable: false,
      value: [...scope],
    });
    result.push(attrsMap);
  }

  if (children) {
    let len = children.length;
    for (let i = 0; i < len; i++) {
      result = result.concat(traverseTemplateAst(children[i], [...scope]));
    }
  }
  if (node.alias) {
    scope.pop();
  }
  if (node.iterator1) {
    scope.pop();
  }
  return result;
}
