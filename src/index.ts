import * as fs from 'fs';
import * as path from 'path';
import { parseTemplate } from './parse/template';
import { ScriptProcessor } from './parse/script';
const template = fs.readFileSync(path.resolve(__dirname, './template.test/large.test.vue'));
const file = template.toString();
console.time('template');
const tokenList = parseTemplate(file);
console.timeEnd('template');


const sp = new ScriptProcessor(tokenList, file);
console.log(sp.getUnusedNodeDesc());

// const tokenSet = new Set(previousTokenList);
// for (let item of tokenList) {
//   if (!tokenSet.has(item)){
//     console.log(item);
//   }
// }