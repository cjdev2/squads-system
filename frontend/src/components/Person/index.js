import React from 'react';
import styled from 'styled-components/macro';
import {media} from '../../Theme';
import {Draggable} from 'react-beautiful-dnd';
import {Icon} from './Icon';
import {SL, CL} from './Badge';
import {Name} from './Name';
import {PersonTooltip} from './PersonTooltip';

export const buildDraggableId = (person, squad) => `${person.name}:${squad.id}`;

export const parseDraggableId = draggableId => {
  const match = draggableId.match(/(.+):(.+)/);
  return {personName: match[1], squadId: match[2]};
};

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 2px;
  margin-bottom: 1px;
  height: 38px;
  ${media.level0`
    height: 26px;
  `};

  background: ${({isDragging}) => (isDragging ? `#fff` : 'inherit')};
  border: 1px solid ${({isDragging}) => (isDragging ? `#ccc` : 'transparent')};
  border-radius: 2px;
  font-variant: all-small-caps;
  &:hover {
    background: #f0f0f0;
    border: 1px solid #ccc;
  }
  margin-right: 10px;
`;

export const Person = ({data, ...props}) => {
  return (
    <>
      <Icon data-tip data-for={data.name} name={data.name} />
      <PersonTooltip data={data} />
      <Name data={data} />
      {data.squadLead && <SL />}
      {data.chapterLead && <CL />}
    </>
  );
};

export const DraggablePerson = ({data, id}) => {
  return (
    <Draggable draggableId={id} index={data.index}>
      {(provided, snapshot) => (
        <Container
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          isDragging={snapshot.isDragging}>
          <Person data={data} />
        </Container>
      )}
    </Draggable>
  );
};
