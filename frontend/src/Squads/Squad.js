import React from 'react';
import styled from 'styled-components/macro';
import * as R from 'ramda';
import {DraggablePerson, buildDraggableId} from '../components/Person';
import {DroppableCell, SquadNameCell, LocationCell} from '../components/Cell';
import {RouterLink} from '../components/Link';

const mapIndexed = R.addIndex(R.map);
const sortByLastName = R.sort(R.ascend(R.prop('last')));

const SquadLink = ({id, children}) => (
  <div>
    <RouterLink to={`/squad/${id}`}>{children}</RouterLink>
  </div>
);

const unassignedSquad = {
  id: 'UNASSIGNED',
};

const UnassignedCell = styled.div`
  grid-column: 3 / 10;
`;

const buildPersons = (squad, showRealOnly) => (people = []) =>
  R.pipe(
    R.filter(
      p => !showRealOnly || (!p.name.match(/open/) && !p.name.match(/need/)),
    ),
    mapIndexed((p, i) => (
      <DraggablePerson key={i} data={p} id={buildDraggableId(p, squad)} />
    )),
  )(sortByLastName(people));

export const Unassigned = ({people, chapterCount, showRealOnly}) => (
  <UnassignedCell>
    <DroppableCell chapter={{name: ''}} squad={unassignedSquad} horizontal>
      {buildPersons(unassignedSquad, showRealOnly)(people)}
    </DroppableCell>
  </UnassignedCell>
);

export const Squad = ({
  squad,
  chapters,
  missions,
  peopleByChapter,
  showRealOnly,
}) => {
  const missionDisplayNames = R.pluck('name', missions);
  const names = [...missionDisplayNames, ...squad.aliases];
  const build = buildPersons(squad, showRealOnly);

  return (
    <>
      <LocationCell>{squad.location}</LocationCell>
      <SquadNameCell>
        {names.map((name, i) => (
          <SquadLink key={i} id={squad.id}>
            {name}
          </SquadLink>
        ))}
      </SquadNameCell>
      {chapters.map((c, i) => (
        <DroppableCell key={i} squad={squad} chapter={c}>
          {build(peopleByChapter[c.name])}
        </DroppableCell>
      ))}
    </>
  );
};
