import * as fs from 'fs';
import * as path from 'path';
import { parseTemplate } from './parse/template';
import { ScriptProcessor } from './parse/script';
// const template = fs.readFileSync(path.resolve(__dirname, './template.test/movie.test.vue'));
const template = fs.readFileSync(path.resolve(__dirname, './parse/__test__/eletemplate.test.vue'));

const file = template.toString();
console.time('template');
const tokenList = parseTemplate(file);
console.log(tokenList)
console.timeEnd('template');
console.time('script');
const sp = new ScriptProcessor(tokenList, file);
console.timeEnd('script');
console.log(sp.getUnusedNodeDesc());


// const tokenSet = new Set(previousTokenList);
// for (let item of tokenList) {
//   if (!tokenSet.has(item)){
//     console.log(item);
//   }
// }