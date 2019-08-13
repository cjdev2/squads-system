import React, {useState} from 'react';
import * as R from 'ramda';
import {DragDropContext} from 'react-beautiful-dnd';
import {useAsync} from 'react-async-hook';
import {fetchData, updateOrgChart} from '../api';
import {buildGraph} from './buildGraph';
import {FullPageSpinner} from '../components/Spinner';
import {Space} from './Space';
import {GraphContext} from './GraphContext';
import {Node} from './Node';
import {makePeopleMap, view, alphaSortKeys} from './utils';
import {Page} from '../components/Page';

const processDragEnd = setData => async result => {
  // console.log('onDragEnd', result);
  const who = result.draggableId;
  const maybeNewLead = R.or(
    view(['combine', 'droppableId'])(result),
    view(['destination', 'droppableId'])(result),
  );
  // console.log({who, maybeNewLead});
  if (R.equals(who, maybeNewLead)) return;

  await updateOrgChart({who, maybeNewLead});
  setData(await fetchData());
};

export const OrgChart = () => {
  const [data, setData] = useState(null);
  const {loading, error} = useAsync(fetchData, [], {
    setResult: setData,
  });

  if (loading) {
    return <FullPageSpinner />;
  }
  if (error) {
    return 'ERROR!';
  }

  const handleDragEnd = processDragEnd(setData);
  const peopleMap = makePeopleMap(data.people);
  const graph = buildGraph(data.people);

  return (
    <Page>
      <DragDropContext onDragEnd={handleDragEnd}>
        <GraphContext.Provider value={{peopleMap, graph}}>
          <Space hor={true}>
            {R.map(name => (
              <Node level={0} key={name} name={name} graph={graph[name]} />
            ))(alphaSortKeys(graph))}
          </Space>
        </GraphContext.Provider>
      </DragDropContext>
    </Page>
  );
};
