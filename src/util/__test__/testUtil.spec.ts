import * as path from 'path';
import * as fs from 'fs';
import { preProcess } from '../../parse/script';
import { getObjectProperty } from '../testUtil';
describe('测试testUtil', () => {
  const file = fs.readFileSync(path.resolve(__dirname, '../../parse/__test__/__fixture__/script.test.vue'));
  const template = file.toString();
  const [ast] = preProcess(template);
  test('get a undefined property from object', () => {
    const undefinedMethod = getObjectProperty(ast, 'nil');
    expect(undefinedMethod).toBe(null);
    
  })
  
})
