import React from 'react';
import styled, {css} from 'styled-components/macro';
import {media} from '../../Theme';
import {getIconImageSrc} from '../../api';
import {GenericAvatar} from '../Icons';
import {AppContext} from '../../App';

const style = css`
  width: ${({theme}) => theme.icon.size.default};
  height: ${({theme}) => theme.icon.size.default};
  border-radius: 2px;
  border: 1px solid #ddd;
  margin-right: 5px;

  ${media.level0`
    width: ${({theme}) => theme.icon.size.level0};
    height: ${({theme}) => theme.icon.size.level0};
    border-radius: 1px;
    margin-right: 3px;
  `};

  ${media.level1`display: none;`};
`;

const Img = styled.img`
  ${style};
`;
const Avatar = styled(GenericAvatar)`
  ${style};
  fill: #333;
`;
export const Icon = ({name, ...rest}) => (
  <>
    <AppContext.Consumer>
      {({showFaces}) => {
        return showFaces ? (
          <Img src={getIconImageSrc(name)} {...rest} />
        ) : (
          <Avatar {...rest} />
        );
      }}
    </AppContext.Consumer>
  </>
);
