import * as fs from 'fs';
import * as path from 'path';
import { ObjectMethod, Identifier } from '@babel/types';
import { getObjectProperty, isTwoSortedArrayEqual } from '../../util/testUtil';
import { preProcess, parseData, ScriptProcessor } from '../script';
import { parseTemplate } from '../template';
import unusedToken from '../..';

describe('测试解析script标签内容', () => {
  test('empty string should return null', () => {
    const code = '';
    const [ast] = preProcess(code);
    expect(ast).toBe(null);
  });

  test('illegal js file should return null', () => {
    const code = 'whatever?';
    const [ast] = preProcess(code);
    expect(ast).toBe(null);
  });

  test('legaljs without ExportDefaultExpression ', () => {
    const code = 'let a = 3';
    const [ast] = preProcess(code);
    expect(ast).toBe(null);
  });

  test('legal js with ExportDefaultExpression', () => {
    const code = `
    export default {

    }
`;
    const [ast] = preProcess(code);

    expect(ast).not.toEqual(null);
    expect(ast.type).toEqual('ObjectExpression');
  });

  describe('single file component', () => {
    test('empty single file component ', () => {
      const code = `
        <template>
          
        </template>
  
        <script>
          export default {
  
          }
        </script>
  `;
      const [ast] = preProcess(code);

      expect(ast).not.toEqual(null);
      expect(ast.type).toEqual('ObjectExpression');
    });

    test('single file component', () => {
      const template = fs.readFileSync(
        path.resolve(__dirname, './script.test.vue')
      );
      const file = template.toString();

      const [ast] = preProcess(file);

      expect(ast).not.toEqual(null);
      expect(ast.type).toEqual('ObjectExpression');
      expect(ast.properties.length).toEqual(6);
    });
  });
});

describe('测试默认导出js部分与template 依赖关系', () => {
  const file = fs.readFileSync(path.resolve(__dirname, './script.test.vue'));
  const template = file.toString();
  const [ast] = preProcess(template);

  describe('parseData', () => {
    test('data is an legal ObjectMethod', () => {
      const dataMethod = getObjectProperty(ast, 'data');

      expect(dataMethod).not.toBe(null);
      expect(dataMethod.type === 'ObjectMethod').toBeTruthy();
      const list = parseData(dataMethod as ObjectMethod);
      const nameList = list.map(item => (<Identifier>item.key).name);
      expect(list.length).toEqual(7);
      expect(nameList.sort()).toEqual(
        [
          'recList',
          'hasLoaded',
          'page',
          'statts',
          'hasMore',
          'loading',
          'thatis',
        ].sort()
      );
    });
    test('data return nothing', () => {
      const code = `
      <template>
  
      </template>
      
      <script>
      export default {
        data() {
          
        }
      }
      </script>
      
      <style>
      
      </style>`;
      const [ast] = preProcess(code);
      const dataMethod = getObjectProperty(ast, 'data');
      expect(dataMethod.type === 'ObjectMethod').toBeTruthy();
      const list = parseData(dataMethod as ObjectMethod);
      expect(list.length).toEqual(0);
    })
    
  });

  describe('测试script 依赖分析', () => {
    const usedTokens = parseTemplate(template);
    const processor = new ScriptProcessor(usedTokens, template);
    expect(processor.getUnusedNodeDesc().length).toEqual(3);
    expect(
      processor
        .getUnusedNodeDesc()
        .map(item => item.name)
        .sort()
    ).toEqual(['thatis', 'test', 'returnTest'].sort());
  });

  describe('测试单文件deadcode 分析', () => {
    const file = fs.readFileSync(
      path.resolve(__dirname, './eletemplate.test.vue')
    );
    const template = file.toString();
    isTwoSortedArrayEqual(unusedToken(template), []);
  });
});
