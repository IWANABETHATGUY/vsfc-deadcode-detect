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

export default function unusedToken(sourcode: string) {
  const tokenList = parseTemplate(sourcode);
  const sp = new ScriptProcessor(tokenList, sourcode);
  return sp.getUnusedNodeDesc();
}
