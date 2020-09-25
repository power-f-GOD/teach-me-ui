import React, { useEffect } from 'react';

import Container from 'react-bootstrap/Container';

import Box from '@material-ui/core/Box';

import { TopicPropsState } from '../../constants/interfaces';

import { bigNumberFormat } from '../../functions/utils';
import { connect } from 'react-redux';
import { dispatch } from '../../appStore';
import { getTrends } from '../../actions';

const RightPane: React.FunctionComponent = (props: any) => {
  const { trends, getTrendsStatus } = props;
  useEffect(() => {
    dispatch(getTrends());
  }, []);

  return (
    <Container fluid className='right-pane'>
      <h4>Trending Hashtags</h4>
      {getTrendsStatus.status !== 'pending' && (
        <ul>
          {trends.map((topic: any, i: number) => (
            <Topic
              topic={topic.hashtag}
              key={i}
              numberOfDiscussions={topic.count}
            />
          ))}
        </ul>
      )}
      {trends.length === 0 && (
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
      <span>{bigNumberFormat(props.numberOfDiscussions)}</span>
    </Box>
  );
};

export default connect((state: any) => ({
  trends: state.trends,
  getTrendsStatus: state.getTrendsStatus
}))(RightPane);
