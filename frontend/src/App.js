import React, {useState} from 'react';
import styled from 'styled-components/macro';
import {ThemeProvider} from './Theme';
import {Normalize} from 'styled-normalize';
import {Router} from '@reach/router';
import {Navigation} from './components/Navigation';
import {Squads} from './Squads';
import {OrgChart} from './OrgChart';

export const AppContext = React.createContext();

const Container = styled.div`
  font-family: 'Roboto', sans-serif;
`;

export default () => {
  const [showFaces, setShowFaces] = useState(true);
  const [showRealOnly, setShowRealOnly] = useState(false);
  const contextValue = {
    showFaces,
    setShowFaces,
    showRealOnly,
    setShowRealOnly,
  };
  return (
    <AppContext.Provider value={contextValue}>
      <Normalize />
      <ThemeProvider>
        <Container>
          <Navigation />
          <Router>
            <Squads path="squads" default />
            <Squads path="squad/:idFilter" />
            <OrgChart path="org" />
          </Router>
        </Container>
      </ThemeProvider>
    </AppContext.Provider>
  );
};
