import { preProcess } from '../script';
// import { parse } from '@babel/parser';
describe('测试解析script标签内容', () => {
  test('empty string should return null', () => {
    const code = '';
    const ast = preProcess(code);
    expect(ast).toBe(null);
  });

  test('illegal js file should return null', () => {
    const code = 'whatever?';
    const ast = preProcess(code);
    expect(ast).toBe(null);
  });

  test('legaljs without ExportDefaultExpression ', () => {
    const code = 'let a = 3';
    const ast = preProcess(code);
    expect(ast).toBe(null);
  });

  test('legal js with ExportDefaultExpression', () => {
    const code = `
    export default {

    }
`;
    const ast = preProcess(code);

    expect(ast).not.toEqual(null);
  });

  test('single file component ', () => {
    const code = `
      <template>
        
      </template>

      <script>
        export default {

        }
      </script>
`;
    const ast = preProcess(code);

    expect(ast).not.toEqual(null);
  });
});

describe('测试默认导出js部分与template 依赖关系', () => {});
