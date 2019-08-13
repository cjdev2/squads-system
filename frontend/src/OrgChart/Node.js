import React from 'react';
import * as R from 'ramda';
import {Droppable} from 'react-beautiful-dnd';
import {GraphContext} from './GraphContext';
import {isMgrofMgr} from './utils';
import {Box, Space} from './Space';
import {DraggablePerson} from '../components/Person';

const sortedKeys = peopleMap =>
  R.pipe(
    R.keys,
    R.map(key => ({
      key,
      ...peopleMap[key],
    })),
    R.sort(R.ascend(R.prop('last'))),
    R.map(R.prop('key')),
  );

const DroppableSpace = ({droppableId, children, isMgr}) => {
  return (
    <Droppable isCombineEnabled droppableId={droppableId}>
      {(provided, snapshot) => (
        <Space
          isMgr={isMgr}
          {...provided.droppableProps}
          ref={provided.innerRef}
          isDraggingOver={snapshot.isDraggingOver}>
          {children}
          {provided.placeholder}
        </Space>
      )}
    </Droppable>
  );
};

export const Node = ({level, name, graph}) => (
  <GraphContext.Consumer>
    {({peopleMap}) => {
      const isMgr = R.keys(graph).length > 0;
      // console.log('name, graph: ', name, graph, isMgr);
      const managesManagers = isMgrofMgr(graph);

      return (
        <Box isMgr={isMgr} debug="in node" level={level}>
          <DroppableSpace droppableId={name} isMgr={isMgr}>
            <DraggablePerson data={peopleMap[name]} id={name} />
          </DroppableSpace>
          {isMgr && (
            <Space hor={managesManagers}>
              {R.map(name => (
                <Node
                  level={level + 1}
                  key={name}
                  name={name}
                  graph={graph[name]}
                />
              ))(sortedKeys(peopleMap)(graph))}
            </Space>
          )}
        </Box>
      );
    }}
  </GraphContext.Consumer>
);
