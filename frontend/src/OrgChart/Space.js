import styled from 'styled-components/macro';
import {darken} from 'polished';
import is, {isNot} from 'styled-is';
import {view} from './utils';

const draggingBg = view(['dnd', 'droppable', 'dragging', 'background']);

export const Space = styled.div`
  padding: 1px;
  margin: 1px;
  transition: background-color 0.2s ease;

  ${is('isDraggingOver')` background: ${({theme}) => draggingBg(theme)};`};
  ${isNot('isDraggingOver')` background: inherit;`};

  ${is('hor')`
    display:flex;
    flex-grow:1;
  `};
  ${isNot('hor')`
    display: block;
  `};
`;

export const Box = styled(Space)`
  ${({level, theme}) => `background: ${darken(level / 20, '#FCFCFC')}`};
  ${is('isMgr')`
    border: 1px solid #999;
  `};
`;
