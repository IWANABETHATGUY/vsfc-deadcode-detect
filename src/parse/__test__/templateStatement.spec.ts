import { getTemplateStatementVariable } from '../templateStatement';

describe('extract variable from statement test', () => {
  test('statement with callexpression', () => {
    expect(
      getTemplateStatementVariable(
        `!(item.number_won === 0 && item.success_clock_in === 1 && other); test(args, $event)`
      ).sort()
    ).toEqual(['item', 'other', 'test', 'args', '$event'].sort());
  });

  test('template literal expression', () => {
    expect(
      getTemplateStatementVariable(
        '`/stars/${starId}?entry=${entry}&entrypage=${entrypage}`'
      ).sort()
    ).toEqual(['starId', 'entry', 'entrypage'].sort());
  });

  test('nesting callexpression', () => {
    expect(
      getTemplateStatementVariable(
        `getThumbUrl($sget(star, 'avatar'), 60 * 60, 60 * 60)`
      ).sort()
    ).toEqual(['getThumbUrl', '$sget', 'star'].sort());
  });

  test('arrayexpression with conditionalExpression item', () => {
    expect(
      getTemplateStatementVariable(
        `[isActive ? activeClass : '', errorClass]`
      ).sort()
    ).toEqual(['isActive', 'activeClass', 'errorClass'].sort());
  });

  test('callExpression with ObjectExpression argument', () => {
    expect(
      getTemplateStatementVariable(
        `$emit('pageClick', {button: artist, artist_id: starId.test.test})`
      ).sort()
    ).toEqual(['$emit', 'artist', 'starId'].sort());
  });

  test('simeple ArrayExpression', () => {
    expect(getTemplateStatementVariable(`[some.a, 'test']`).sort()).toEqual([
      'some',
    ]);
  });

  test('ObjectExpression surround with a parenthesis', () => {
    expect(
      getTemplateStatementVariable(
        `({a: item.number_won === 0, b: !(item.number_won === 0 && item.success_clock_in === 1 && what)})`
      ).sort()
    ).toEqual(['item', 'what'].sort());
  });

  test('ObjectExpression', () => {
    expect(
      getTemplateStatementVariable(
        `{a: item.number_won === 0, b: !(item.number_won === 0 && item.success_clock_in === 1 && what)}`
      ).sort()
    ).toEqual(['item', 'what'].sort());
  });

  test('LogicalExpression', () => {
    expect(
      getTemplateStatementVariable(`hasLoaded && !recordList.length`).sort()
    ).toEqual(['hasLoaded', 'recordList'].sort());
  });

  test('BinaryExpression', () => {
    expect(getTemplateStatementVariable(`item in recordList`).sort()).toEqual(
      ['item', 'recordList'].sort()
    );
  });

  test('CallExpression with TemplateLiteral argument', () => {
    expect(
      getTemplateStatementVariable("click(`/${uid}`,'info')").sort()
    ).toEqual(['uid', 'click'].sort());
  });

  test('TemplateLiteral with expression is CallExpression', () => {
    expect(
      getTemplateStatementVariable(
        "`/reviews/${$sget(item, 'cinecism_info', 'id')}?from=competition`"
      ).sort()
    ).toEqual(['$sget', 'item'].sort());
  });

  test('ObjectExpression with CallExpression as its value', () => {
    expect(
      getTemplateStatementVariable(
        `{'is-current': checkIsSelect(item.identification, tag.value, index)}`
      ).sort()
    ).toEqual(['checkIsSelect', 'item', 'tag', 'index'].sort());
  });

  test('v-for with index argument', () => {
    expect(
      getTemplateStatementVariable(`(index, item) in list`).sort()
    ).toEqual(['index', 'item', 'list'].sort());
  });

  test('v-for with number literal', () => {
    expect(getTemplateStatementVariable(`(item, index) in 4 `).sort()).toEqual(
      ['item', 'index'].sort()
    );
  });
});
