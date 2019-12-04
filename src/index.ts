import { parseTemplate } from './parse/template';
import { ScriptProcessor } from './parse/script';

export {
  parseData,
  ScriptProcessor,
  parseMethods,
  parseProps,
  parseWatch,
  preProcess,
} from './parse/script';

export { parseTemplate } from './parse/template';

export {
  getTemplateStatementVariable,
  getVariable,
} from './parse/templateStatement';

/**
 * 获取当前单文件应用的未使用token 以及相应的描述
 * 
 * @export
 * @param {string} sourcode 
 * @returns 
 */
export function unusedToken(sourcode: string) {
  const tokenList = parseTemplate(sourcode);
  const sp = new ScriptProcessor(tokenList, sourcode);
  return sp.getUnusedNodeDesc();
}
