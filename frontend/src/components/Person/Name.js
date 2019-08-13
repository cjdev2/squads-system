import React from 'react';
import styled from 'styled-components/macro';
import * as R from 'ramda';

export const Container = styled.span`
  white-space: nowrap;
`;

export const FirstName = styled.span`
  @media (max-width: 900px) {
    display: none;
  }
`;
export const LastName = styled.span``;

const displayTitle = title => {
  switch (title) {
    case 'Senior Software Engineer':
      return 'Senior Engineer';
    case 'Associate Software Engineer':
      return "SE2";
    case 'Software Engineer 3':
      return 'SE3';
    default:
      return title;
  }
};

export const Name = ({data}) => {
  let {first, last} = data;
  if (first) {
    first = `${R.head(first)} `;
  } else {
    first = '';
    last = displayTitle(data.title);
  }
  return (
    <Container>
      <FirstName>{first}</FirstName>
      <LastName>{last}</LastName>
    </Container>
  );
};
