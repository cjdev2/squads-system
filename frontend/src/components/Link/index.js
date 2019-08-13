import styled, {css} from 'styled-components/macro';
import {Link as ReachLink} from '@reach/router';

export const link = css`
  color: ${({theme}) => theme.link.color};
  text-decoration: none;
  border-bottom: 1px solid transparent;
  &:hover {
    color: ${({theme}) => theme.link.hover.color};
    border-bottom: 1px solid ${({theme}) => theme.link.hover.color};
  }
`;
export const Link = styled.a`
  ${link};
`;

export const RouterLink = styled(ReachLink)`
  ${link};
`;
