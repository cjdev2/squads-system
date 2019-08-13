import React from 'react';
import * as R from 'ramda';
import styled from 'styled-components/macro';
import {useAsync} from 'react-async-hook';
import {fetchMissions, fetchBacklogs} from '../api';
import {FullPageSpinner} from '../components/Spinner';
import {Mission} from './Mission';
import {mapIndexed} from '../utils';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const SquadDetails = ({squad}) => {
  // console.log('squadDetails.squad: ', squad);
  const m = useAsync(() => fetchMissions(squad));
  const b = useAsync(() => fetchBacklogs(squad));

  if (m.loading || b.loading) {
    return <FullPageSpinner />;
  }

  if (m.error || b.error) {
    return 'Error!';
  }

  const f = (mission, backlog) => ({mission, backlog});
  const missionsWithBacklogs = R.zipWith(f, m.result, b.result);

  const full = (sm, m) => ({squadMission: sm, ...m});
  const fullMissions = R.zipWith(full, squad.missions, missionsWithBacklogs);

  return (
    <Container>
      {mapIndexed((m, idx) => (
        <Mission
          key={m.mission}
          mission={m}
          contactInfo={idx === 0 ? squad.squad.people : null}
        />
      ))(fullMissions)}
    </Container>
  );
};
