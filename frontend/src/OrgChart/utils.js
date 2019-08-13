import * as R from 'ramda';

export const alphaSortKeys = graph =>
  R.sort(R.ascend(R.toLower), R.keys(graph));

export const makePeopleMap = R.pipe(
  R.addIndex(R.map)((p, index) => ({
    index,
    ...p,
  })),
  R.groupBy(R.prop('name')),
  R.map(R.prop(0)),
);

export const isMgrofMgr = R.pipe(
  R.values,
  R.filter(p => R.gt(R.prop('length', R.keys(p)), 0)),
  R.length,
  R.lt(0),
);

export * from '../utils';
