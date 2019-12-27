import { ASTElement } from 'vue-template-compiler';
export function traverseTemplateAst(
  node: ASTElement | any,
  scope: string[]
): Array<{ [prop: string]: any }> {
  if (!node) {
    return [];
  }
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
        if (key === 'v-for') {
          attrsMap[key] = [node.for, node.alias, node.iterator1].filter(Boolean).join(',');
        } else {
          attrsMap[key] = node.attrsMap[key];
        }
      }
    }
    Object.defineProperty(attrsMap, '__scope__', {
      enumerable: false,
      value: [...scope],
    });
    result.push(attrsMap);
  } else if (node.type === 2) {
    const attrsMap = {};
    const regex = /{{([\s\S]+?)}}/g;
    let match: RegExpExecArray;
    let index = 1;
    while ((match = regex.exec(node.text))) {
      attrsMap[`__text__${index++}`] = match[1].trim();
    }
    Object.defineProperty(attrsMap, '__scope__', {
      enumerable: false,
      value: [...scope],
    });
    result.push(attrsMap);
  }

  if (children && children.length) {
    let len = children.length;
    for (let i = 0; i < len; i++) {
      result = result.concat(traverseTemplateAst(children[i], [...scope]));
    }
  }
  if (node.ifConditions) {
    const ifConditions = node.ifConditions;
    for (let condition of ifConditions) {
      if (node !== condition.block) {
        result = result.concat(
          traverseTemplateAst(condition.block, [...scope])
        );
      }
    }
  }
  if (node.scopedSlots) {
    Object.keys(node.scopedSlots).forEach(key => {
      if ('type' in node.scopedSlots[key]) {
        result = result.concat(
          traverseTemplateAst(node.scopedSlots[key], [...scope])
        );
      }
    });
  }
  if (node.alias) {
    scope.pop();
  }
  if (node.iterator1) {
    scope.pop();
  }
  return result;
}
