import React from 'react';
import * as R from 'ramda';
import styled from 'styled-components/macro';
import {media} from '../Theme';
import {Link} from '../components/Link';
import {ContactIcon} from '../components/Icons';

const Ul = styled.ul`
  list-style-type: none;
  padding-inline-start: 0;
`;
const Li = styled.li`
  margin-bottom: 8px;
`;

const List = ({data}) => {
  return <Ul>{R.map(d => <Li key={d}>{d}</Li>)(data)}</Ul>;
};

const BacklogIcon = styled.img`
  width: 16px;
  margin-right: 4px;
`;
const LinkWrapper = styled.div`
  display: flex;
  align-items: center;
`;
const BacklogLink = ({item}) => {
  return (
    <LinkWrapper>
      <BacklogIcon src={item.iconUrl} />
      <Link href={item.link}>{item.name}</Link>
    </LinkWrapper>
  );
};

const BacklogList = ({backlog = []}) => (
  <Ul>
    {R.map(b => (
      <Li key={b.name}>
        <BacklogLink item={b} />
      </Li>
    ))(backlog)}
  </Ul>
);

const Section = styled.div`
  margin: 8px;
  padding: 8px;
  flex-grow: 1;
`;

const Middle = styled.div`
  display: flex;
  justify-content: space-between;
  ${media.level1`
    display: block;
  `};
`;

const Container = styled.div`
  background: #f3f3f3;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  flex-grow: 1;
  margin: 15px;
  &:first-of-type {
    margin-left: 0;
  }
  &:last-of-type {
    margin-right: 0;
  }
`;

const Title = styled.div`
  font-size: 1.4em;
  font-variant: all-small-caps;
  padding-bottom: 4px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 0.5em;
  display: flex;
  justify-content: space-between;
`;

const handleContactClick = emails => {
  window.location.href = `mailto:${emails}`;
};
const StyledContactIcon = styled(ContactIcon)`
  &:hover {
    cursor: pointer;
    fill: ${({theme}) => theme.link.color};
  }
  &:active {
    cursor: pointer;
    fill: ${({theme}) => '#fff'};
  }
`;
const StyledContactWrapper = styled.div`
  padding: 0 4px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #ddd;
  }
  &:active {
    background: ${({theme}) => theme.link.color};
  }
`;
const ContactInfo = ({data}) => {
  if (!data) return null;
  const emails = R.join(',', R.map(n => `${n}@cj.com`)(data));
  return (
    <StyledContactWrapper>
      <StyledContactIcon onClick={() => handleContactClick(emails)} />
    </StyledContactWrapper>
  );
};

export const Mission = ({mission, contactInfo}) => {
  // console.log('mission: ', mission, contactInfo);
  return (
    <Container>
      <Section>
        <Title>
          <span>Mission</span>
          <ContactInfo data={contactInfo} />
        </Title>
        <div>{mission.mission}</div>
      </Section>
      <Middle>
        <Section>
          <Title>Feature Domain</Title>
          <div>
            <List data={mission.squadMission.domain.existingFeatures} />
          </div>
        </Section>
        <Section>
          <Title>Architectural Domain</Title>
          <div>
            <List data={mission.squadMission.domain.existingArchitecture} />
          </div>
        </Section>
        <Section>
          <Title>Business Units</Title>
          <div>
            <List data={mission.squadMission.domain.businessUnits} />
          </div>
        </Section>
      </Middle>
      <Section>
        <Title>Upcoming Projects</Title>
        <div>
          <BacklogList backlog={mission.backlog} />
        </div>
      </Section>
    </Container>
  );
};
