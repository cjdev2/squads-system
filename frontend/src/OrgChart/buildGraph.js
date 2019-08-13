import * as R from 'ramda';

const ROOT = 'waleed';

const makeMap = R.pipe(
  R.groupBy(R.prop('name')),
  R.map(R.prop(0)),
);

export const buildGraph = (people, root = ROOT) => {
  const peopleByName = makeMap(people);

  const buildChain = (name, chain) => {
    const person = peopleByName[name];
    if (person.lead === root) {
      return chain;
    }
    const nextName = peopleByName[person.lead].name;
    return buildChain(nextName, [...chain, nextName]);
  };

  return R.reduce((graph, person) => {
    const finalChain = R.reverse(buildChain(person.name, []));

    const updateGraph = idx => {
      const path = R.take(idx + 1, finalChain);
      const parentNodeMissing = R.isNil(R.view(R.lensPath(path))(graph));

      if (parentNodeMissing) {
        return R.assocPath(path, {}, graph);
      } else {
        const fullPath = [...path, person.name];
        const existingFullNode = R.view(R.lensPath(fullPath), graph);

        if (idx === finalChain.length && R.isNil(existingFullNode)) {
          return R.assocPath(fullPath, {}, graph);
        }
        // else do nothing, the node was added earlier as a side effect
        // of adding a descendent node
      }
      return graph;
    };

    R.forEach(idx => {
      graph = updateGraph(idx);
    })(R.range(0, finalChain.length + 1));

    return graph;
  }, {})(people);
};
