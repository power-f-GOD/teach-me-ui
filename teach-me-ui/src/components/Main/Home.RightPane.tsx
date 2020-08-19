import React from 'react';

import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';

import { TopicPropsState } from '../../constants/interfaces';

import { useGetTrends } from '../../hooks/api';

const RightPane: React.FunctionComponent = () => {
  const [, trends, getTrendsIsLoading] = useGetTrends();
  console.log(trends, getTrendsIsLoading);
  return (
    <Container className='right-pane' fluid>
      <h4>Trending Hashtags</h4>
      {!getTrendsIsLoading && trends !== null && (
        <ul>
          {trends.hashtags.map((topic: any, i: number) => (
            <Topic
              topic={topic.hashtag}
              key={i}
              numberOfDiscussions={topic.count}
            />
          ))}
        </ul>
      )}
      {(trends === null || trends.hashtags.length === 0) && (
        <Box
          display='flex'
          justifyContent='center'
          color='#888'
          paddingY='2rem'>
          No trends!
        </Box>
      )}
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

export default RightPane;
