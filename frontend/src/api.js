import * as R from 'ramda';
export const getIconImageSrc = name => `/people/${name}/logo`;

export const fetchData = async () => {
  // console.log('[api.fetchData]');
  return fetch(`/data.js`).then(result => {
    if (result.status !== 200) {
      throw new Error('bad status = ' + result.status);
    }
    return result.json();
  });
};

const updateData = async payload => {
  // console.log('[api.updateData]', payload);
  return fetch('/moves', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(result => {
    if (result.status !== 200) {
      throw new Error('bad status = ' + result.status);
    }
    return result;
  });
};

export const updateSquadChapter = async ({
  who,
  maybeNewSquad,
  maybeNewChapter,
}) => updateData({who, maybeNewSquad, maybeNewChapter});

export const updateOrgChart = async ({who, maybeNewLead}) =>
  updateData({who, maybeNewLead});

export const fetchBacklogs = async ({squad}) => {
  // console.log('[api.fetchBacklogs]');
  const urls = R.map(m => `/missions/${m}/backlog`)(squad.missions);
  return Promise.all(
    urls.map(url => {
      return fetch(url).then(result => {
        if (result.status === 404) return {};
        if (result.status !== 200) {
          throw new Error('bad status = ' + result.status);
        }
        return result.json();
      });
    }),
  );
};

export const fetchMissions = async ({squad}) => {
  // console.log('[api.fetchMissions]');
  const urls = R.map(m => `/missions/${m}/mission`)(squad.missions);
  return Promise.all(
    urls.map(url => {
      return fetch(url).then(result => {
        if (result.status === 404) return '';
        if (result.status !== 200) {
          throw new Error('bad status = ' + result.status);
        }
        return result.text();
      });
    }),
  );
};
