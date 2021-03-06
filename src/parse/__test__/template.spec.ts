import { parseTemplate } from '../template';
import * as fs from 'fs';
import * as path from 'path';
describe('测试模板提取变量', () => {
  test('vue single file component', () => {
    const template = fs.readFileSync(
      path.resolve(__dirname, './__fixture__/template.test.vue')
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

  test('sfc with component import', () => {
    const template = fs.readFileSync(
      path.resolve(__dirname, './__fixture__/templateWithComponent.test.vue')
    );
    const file = template.toString();
    expect(parseTemplate(file).sort()).toEqual(
      ['recommendMovies', 'movieLink', 'reportFilm', 'showAllMedia'].sort()
    );
  });

  test('template statement with error', () => {
    const code = `
    <template>
      <div>{{test??b}}</div>
    </template>

    <script>
    export default {

    }
    </script>

    <style>

    </style>
    `;
    expect(parseTemplate(code).sort()).toEqual([].sort());
  });
});
