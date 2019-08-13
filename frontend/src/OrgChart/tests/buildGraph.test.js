import {buildGraph} from '../buildGraph';

describe('buildGraph', () => {
  test('should buildGraph', () => {
    const people = [
      {name: 'a', lead: 'b'},
      {name: 'b', lead: 'c'},
      {name: 'c', lead: 'c'},
      {name: 'd', lead: 'a'},
      {name: 'e', lead: 'a'},
    ];
    const expected = {b: {a: {d: {}, e: {}}}, c: {}};
    const result = buildGraph(people, 'c');
    expect(result).toEqual(expected);
  });
});
