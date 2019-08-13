import React from 'react';
import styled from 'styled-components/macro';
import {LoadingIcon} from '../Icons';

const FullPageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;
export const FullPageSpinner = props => (
  <FullPageWrapper>
    <LoadingIcon {...props} size={'5em'} />
  </FullPageWrapper>
);

const InlineWrapper = styled.div`
  margin: 0 0.5em;
`;
export const InlineSpinner = props => {
  return (
    <InlineWrapper>
      <LoadingIcon {...props} size={'2em'} />
    </InlineWrapper>
  );
};
