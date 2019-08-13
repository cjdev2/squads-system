import styled from 'styled-components/macro';

export const Grid = styled.div`
  display: grid;
  grid-gap: 3px;
  ${props => `grid-template-columns: auto auto repeat(${props.cols}, 1fr)`};
  /* specify the height of all the rest of the rows */
  grid-auto-rows: minmax(auto, auto);
`;
