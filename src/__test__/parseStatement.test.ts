import { getTemplateStatementVariable } from '../parseStatement';

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
});
