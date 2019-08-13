import * as R from 'ramda';

const chapterNameMap = {
  product: 'Product',
  frontend: 'Frontend',
  data: 'Data',
  security: 'Security',
  apis: 'APIs',
  operations: 'Operations',
  other: 'Other',
};

export const buildChapters = R.pipe(
  R.prepend({name: 'product'}),
  R.append({name: 'other'}),
  R.map(c => ({...c, displayName: chapterNameMap[c.name] || c.name})),
);

const isChapterLead = (chapters, person) =>
  R.contains(person.name)(R.map(c => c.lead)(chapters));

const getChapterForPerson = person => {
  // bucket people with chapters we dont recognize as "other"
  const containsChapter = R.contains(R.prop('chapter', person))(
    R.keys(chapterNameMap),
  );
  return containsChapter ? person.chapter : 'other';
};

export const getPeopleByChapter = (chapters, allPeople) => squad =>
  R.pipe(
    R.map(pis => {
      const person = R.find(R.propEq('name', pis))(allPeople);
      const chapterForPerson = getChapterForPerson(person);

      return {
        ...person,
        chapter: chapterForPerson,
        squadLead: person.name === squad.lead,
        chapterLead: isChapterLead(chapters, person),
      };
    }),
    // R.forEach(console.log),
    R.groupBy(R.prop('chapter')),
  )(squad.people);
