import React from 'react';
import styled from 'styled-components/macro';
import {Droppable} from 'react-beautiful-dnd';
import {media} from '../../Theme';
import is from 'styled-is';
import {view} from '../../utils';

const draggingBg = view(['dnd', 'droppable', 'dragging', 'background']);

const Cell = styled.div`
  padding: 4px;
  font-variant: all-small-caps;
  transition: background-color 0.2s ease;
  background: #f6f6f6;
  color: #333;
  ${is('isDraggingOver')` background: ${({theme}) => draggingBg(theme)};`};
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
`;

export const LabelCell = styled(Cell)`
  background: #eee;
`;
export const ChapterCell = LabelCell;
export const SquadNameCell = LabelCell;
export const LocationCell = styled(LabelCell)`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding-top: 8px;

  ${media.level3`width: 0; padding: 0;`};
`;

const DropCell = styled(Cell)`
  min-height: 63px;
  ${media.level0`min-height: 45px;`};
  ${is('horizontal')`display: flex;`};
`;

export const DroppableCell = ({squad, chapter, children, ...props}) => {
  const droppableId = {
    c: chapter.name,
    s: squad.id,
  };
  return (
    <Droppable droppableId={JSON.stringify(droppableId)}>
      {(provided, snapshot) => (
        <DropCell
          {...provided.droppableProps}
          ref={provided.innerRef}
          isDraggingOver={snapshot.isDraggingOver}
          {...props}>
          {children}
          {provided.placeholder}
        </DropCell>
      )}
    </Droppable>
  );
};
