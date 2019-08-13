import React, {useState} from 'react';
import * as R from 'ramda';
import {DragDropContext} from 'react-beautiful-dnd';
import {useAsync} from 'react-async-hook';
import {fetchData, updateSquadChapter} from '../api';

import {buildChapters, getPeopleByChapter} from '../Chapter';
import {ChapterCell} from '../components/Cell';
import {Squad, Unassigned} from './Squad';
import {parseDraggableId} from '../components/Person';
import {FullPageSpinner} from '../components/Spinner';
import {Grid} from './Grid';
import {SquadDetails} from './SquadDetails';
import {mapIndexed} from '../utils';
import {Page} from '../components/Page';
import {AppContext} from '../App';

const sortSquads = R.sortWith([
  R.ascend(R.path(['squad', 'location'])),
  R.ascend(
    R.compose(
      R.toLower,
      R.path(['missions', 0, 'name']),
    ),
  ),
]);

const getSquadMissions = allMissions => squad =>
  R.map(key => R.find(R.propEq('key', key))(allMissions))(squad.missions);

const filterSquads = filter => squads =>
  R.isNil(filter) ? squads : R.filter(R.propEq('id', filter))(squads);

const getUnassigned = (people, squads) => {
  const inSquad = R.flatten(R.pluck('people')(squads));
  return R.filter(p => R.not(inSquad.includes(p.name)))(people);
};

export const Squads = ({idFilter}) => {
  const [data, setData] = useState(null);
  const {loading, error} = useAsync(fetchData, [], {
    setResult: setData,
  });

  if (loading) {
    return <FullPageSpinner />;
  }
  if (error) {
    return 'Error!';
  }

  const handleDragEnd = async result => {
    // console.log('result: ', result);
    if (!result.combine && !result.destination) return;
    const {personName: who} = parseDraggableId(result.draggableId);
    const {s: maybeNewSquad, c: maybeNewChapter} = JSON.parse(
      result.destination.droppableId,
    );

    await updateSquadChapter({
      who,
      maybeNewSquad,
      maybeNewChapter,
    });
    const newData = await fetchData();
    setData(newData);
  };

  const {squads, people: rawPeople, chapters: rawChapters, missions} = data;
  const people = mapIndexed((p, i) => R.assoc('index', i, p))(rawPeople);
  const chapters = buildChapters(rawChapters);
  const getMissions = getSquadMissions(missions);
  const getPeopleByChapterForSquad = getPeopleByChapter(chapters, people);
  const gridSquads = R.pipe(
    filterSquads(idFilter),
    mapIndexed((squad, i) => ({
      i,
      squad,
      chapters,
      missions: getMissions(squad),
      peopleByChapter: getPeopleByChapterForSquad(squad),
    })),
    sortSquads,
  )(squads);

  const unassignedPeople = getUnassigned(people, squads);

  return (
    <Page>
      <AppContext.Consumer>
        {({showRealOnly}) => (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Grid cols={chapters.length}>
              {R.isNil(idFilter) && (
                <Unassigned
                  people={unassignedPeople}
                  chapterCount={chapters.length}
                  showRealOnly={showRealOnly}
                />
              )}

              <div />
              <div />
              {chapters.map(c => (
                <ChapterCell key={c.name}>{c.displayName}</ChapterCell>
              ))}
              {gridSquads.map((row, i) => (
                <Squad key={i} {...row} showRealOnly={showRealOnly} />
              ))}
            </Grid>
            {idFilter && <SquadDetails squad={gridSquads[0]} />}
          </DragDropContext>
        )}
      </AppContext.Consumer>
    </Page>
  );
};
