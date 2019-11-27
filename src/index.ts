import * as fs from 'fs';
import * as path from 'path';
import { parseTemplate } from './parse/template';
import { ScriptProcessor } from './parse/script';
const template = fs.readFileSync(path.resolve(__dirname, './parse/__test__/script.test.vue'));
const file = template.toString();
console.time('template');
const tokenList = parseTemplate(file);
console.timeEnd('template');
console.time('parseScript')
const sp = new ScriptProcessor(tokenList, file);
console.timeEnd('parseScript')
console.log(sp.getUnusedNodeDesc());