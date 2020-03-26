import * as fs from 'fs';
import * as path from 'path';
import { parseTemplate } from './parse/template';
import { ScriptProcessor } from './parse/script';
// import { getTemplateStatementVariable } from './parse/templateStatement';
const template = fs.readFileSync(path.resolve(__dirname, './template.test/destruct.test.vue'));
// const template = fs.readFileSync(path.resolve(__dirname, './parse/__test__/eletemplate.test.vue'));

const file = template.toString();
console.time('template');
const tokenList = parseTemplate(file);
console.timeEnd('template');
console.time('script');
const sp = new ScriptProcessor(tokenList, file);
console.timeEnd('script');
console.log(sp.getUnusedNodeDesc());

