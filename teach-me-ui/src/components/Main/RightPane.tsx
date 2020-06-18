import React from 'react';

import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';

import { TopicPropsState } from '../../constants/interfaces';

const RightPane: React.FunctionComponent = () => {
  return (
    <Container className='right-pane' fluid>
      <h4>Trending Topics</h4>
      <ul>
        {topics.map((topic, i) => (
          <Topic topic={topic} key={i} numberOfDiscussions={2700} />
        ))}
      </ul>
    </Container>
  );
};

const Topic: React.FunctionComponent<TopicPropsState> = (props) => {
  return (
    <Box component='li'>
      <span>{props.topic}</span>
      <span>{props.numberOfDiscussions}</span>
    </Box>
  );
};

const topics = ['Physics', 'Astronomy', 'How to study'];

export default RightPane;
