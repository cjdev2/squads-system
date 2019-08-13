import React from 'react';
import styled from 'styled-components/macro'; //eslint-disable-line
import ReactTooltip from 'react-tooltip';
import {Icon} from './Icon';

export const PersonTooltip = ({data}) => {
  return (
    <ReactTooltip id={data.name} effect="solid" delayShow={400} delayHide={100}>
      <div css={'display: flex;'}>
        <div
          css={
            'display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; padding-right: 16px;padding-top:4px;'
          }>
          <Icon name={data.name} />
        </div>
        <div>
          <div
            css={`
              font-size: 1.3em;
            `}>
            {data.first ? `${data.first} ${data.last}` : data.name}
          </div>
          <div>{data.title}</div>
          {data.squadLead && <div>Squad Lead</div>}
          <div>
            {data.chapter} {data.chapter !== 'product' && 'Chapter'}
            {data.chapterLead && ' Lead'}
          </div>
          <div>{data.location}</div>
        </div>
      </div>
    </ReactTooltip>
  );
};
