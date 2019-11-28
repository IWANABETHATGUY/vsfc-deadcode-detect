import { traverseTemplateAst } from '../traverse';
describe('traverse TemplateAst', () => {
  test('traverse a element not a node', () => {
    expect(traverseTemplateAst(null, [])).toEqual([]);
  });
});
