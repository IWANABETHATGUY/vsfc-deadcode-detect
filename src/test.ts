import * as parser from '@babel/parser';
import  { Node } from '@babel/traverse';
import { isNode } from '@babel/types';
// import traverse, { NodePath } from '@babel/traverse';
// const code = `
// const a = {
//   success: item.number_won,
//   show: !(item.number_won === 0 && item.success_clock_in === 1 && fuck),
// };

// `;
const code = `!(item.number_won === 0 && item.success_clock_in === 1 && fuck); test()`;
console.time('traverse');

const ast = parser.parse(code);
// traverse(ast, {
//   enter(path: NodePath) {
    
//   },
// });
const queue: Node[] = [ast];
// Object.keys(ast).forEach(key => {
//   if (ast[key].type) {
//     console.log(ast[key])
//   }
// })
while (queue.length) {
  const cur = queue.shift();
  if (cur.type === 'Identifier') {
    console.log(cur.name);
  } else {
    const keys = Object.keys(cur);
    for (let i = 0; i < keys.length; i++) {
      const value = cur[keys[i]];
      if (Array.isArray(value)) {
        queue.push(...value);
      } else if (isNode(value)) {
        queue.push(value);
        if (value.type === 'Identifier') {
          console.log((value as any).parent);
          break;
        }
      }
    }
  }
}
console.timeEnd('traverse');
