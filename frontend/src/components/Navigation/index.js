import React from 'react';
import styled, {css} from 'styled-components/macro';
import is from 'styled-is';
import {Location} from '@reach/router';
import {RouterLink} from '../Link';
import {AppContext} from '../../App';
import {GenericAvatar, HumanIcon} from '../Icons';

const H1 = styled.div`
  font-size: 1.4em;
  text-transform: uppercase;
`;

const StyledLink = styled(RouterLink)`
  color: ${({theme}) => theme.link.color};
  text-decoration: none;
  margin: 0px 8px;
  border-bottom: 1px solid transparent;

  &:hover {
    color: ${({theme}) => theme.link.hover.color};
    border-bottom: 1px solid ${({theme}) => theme.link.hover.color};
  }
`;

const Nav = styled.nav`
  padding: 8px;
  font-variant: all-small-caps;
  font-size: 1.3em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: #fff;
  border-bottom: 1px solid #ddd;
  margin-bottom: 8px;
`;

const navButton = css`
  width: 24px;
  height: 24px;
  padding: 4px;
  margin: 0 4px;
  border-radius: 50%;
  cursor: pointer;

  fill: #333;
  background: #fff;
  &:hover {
    background: #eee;
  }
  ${is('on')`
    fill: #fff;
    background: #333;
    &:hover {
      background: #555;
    }
  `};
`;

const Avatar = styled(GenericAvatar)`
  ${navButton};
`;
const ShowFacesToggle = () => {
  return (
    <AppContext.Consumer>
      {({showFaces, setShowFaces}) => (
        <Avatar on={showFaces} onClick={() => setShowFaces(!showFaces)} />
      )}
    </AppContext.Consumer>
  );
};

const RealPeople = styled(HumanIcon)`
  ${navButton};
`;
const RealPeopleToggle = () => {
  return (
    <AppContext.Consumer>
      {({showRealOnly, setShowRealOnly}) => (
        <RealPeople
          on={showRealOnly}
          onClick={() => setShowRealOnly(!showRealOnly)}
        />
      )}
    </AppContext.Consumer>
  );
};

const Right = styled.div`
  display: flex;
  align-items: center;
`;

export const Navigation = props => (
  <Location>
    {props => {
      return (
        <Nav>
          <H1>Squads</H1>
          <Right>
            <RealPeopleToggle />
            <ShowFacesToggle />
            <StyledLink to="squads">squads</StyledLink>
            <StyledLink to="org">org chart</StyledLink>
          </Right>
        </Nav>
      );
    }}
  </Location>
);
