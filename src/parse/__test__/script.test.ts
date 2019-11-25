import { preProcess } from '../script';

describe('测试解析script标签内容', () => {
  test('empty string should return null', () => {
    const code = '';
    const ast = preProcess(code);
    expect(ast).toBe(null);
  })

  test('illegal js file should return null', () => {
    const code = 'whatever';
    const ast = preProcess(code);
    expect(ast).toBe(null);
  })
  
  
  
})

describe('测试默认导出js部分与template 依赖关系', () => {
  
})
