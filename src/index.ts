import * as fs from 'fs';
import * as path from 'path';
import { parseTemplate } from './parse/template';
import { ScriptProcessor } from './parse/script';
const template = fs.readFileSync(path.resolve(__dirname, './parse/__test__/large.test.vue'));
const file = template.toString();
console.time('template');
const tokenList = parseTemplate(file);
console.timeEnd('template');
console.log(tokenList);
console.time('parseScript')
const sp = new ScriptProcessor(tokenList, file);
console.log(sp.getUnusedNodeDesc());
console.timeEnd('parseScript')

const tokenSet = new Set(tokenList);
for (let item of sp.getUnusedNodeDesc()) {
  if (tokenSet.has(item.name)){
    console.log(item.name);
  }
}