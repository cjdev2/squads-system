import * as R from 'ramda';
export const view = path => R.view(R.lensPath(path));
export const mapIndexed = R.addIndex(R.map);
