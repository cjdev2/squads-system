import React from 'react';
import styled from 'styled-components/macro';

const Badge = styled.span`
  font-size: 0.9em;
  border: 1px solid #999;
  background: #fff;
  border-radius: 1px;
  margin-left: 5px;
  padding: 0 4px;
`;

export const SL = () => <Badge>S</Badge>;
export const CL = () => <Badge>C</Badge>;
