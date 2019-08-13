import React from 'react';
import {css} from 'styled-components/macro';
import {ThemeProvider as SCThemeProvider} from 'styled-components/macro';

export const theme = {
  media: {
    level0: 1300,
    level1: 1090,
    level2: 900,
    level3: 810,
  },
  colors: {
    cjGreen: '#49c5b1',
  },
  dnd: {
    droppable: {
      dragging: {
        background: '#bda',
      },
    },
  },
  link: {
    color: '#2D2DBD',
    hover: {
      color: 'blue',
    },
  },
  icon: {
    size: {
      default: '36px',
      level0: '24px',
    },
  },
};

export const media = Object.keys(theme.media).reduce((acc, label) => {
  acc[label] = (...args) => css`
    @media (max-width: ${theme.media[label]}px) {
      ${css(...args)};
    }
  `;

  return acc;
}, {});

export const ThemeProvider = props => (
  <SCThemeProvider {...props} theme={theme} />
);
