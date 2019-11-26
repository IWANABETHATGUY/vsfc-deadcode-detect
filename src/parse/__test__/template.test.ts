import { parseTemplate } from '../template';
import * as fs from 'fs';
import * as path from 'path';
describe('测试模板提取变量', () => {
  test('vue single file component', () => {
    const template = fs.readFileSync(
      path.resolve(__dirname, './template.test.vue')
    );
    const file = template.toString();
    expect(parseTemplate(file).sort()).toEqual(
      [
        'statistic',
        'filter',
        'list',
        'recordList',
        'what',
        'some',
        'loading',
        'isActive',
        'activeClass',
        'errorClass',
        'hasLoaded',
      ].sort()
    );
  });
});
