import { parseTemplate } from './parse/template';
import { ScriptProcessor } from './parse/script';
export interface DetectOptions {
  nuxt: boolean;
}
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
 * @param {string} sourceCode
 * @returns
 */
export function unusedToken(
  sourceCode: string,
  options: DetectOptions = { nuxt: false }
) {
  const tokenList = parseTemplate(sourceCode);
  const sp = new ScriptProcessor(tokenList, sourceCode, options);
  return sp.getUnusedNodeDesc();
}
