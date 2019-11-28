import * as fs from 'fs';
import * as path from 'path';
import { parseTemplate } from './parse/template';
import { ScriptProcessor } from './parse/script';
const template = fs.readFileSync(path.resolve(__dirname, './template.test/large.test.vue'));
const file = template.toString();
const tokenList = parseTemplate(file);
console.log(tokenList);
const sp = new ScriptProcessor(tokenList, file);
console.log(sp.getUnusedNodeDesc());

// const tokenSet = new Set(tokenList);
// for (let item of sp.getUnusedNodeDesc()) {
//   if (tokenSet.has(item.name)){
//     console.log(item.name);
//   }
// }