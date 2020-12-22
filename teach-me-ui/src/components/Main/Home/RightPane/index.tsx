import React, { useEffect } from 'react';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import {
  TopicPropsState,
  CREATE_QUESTION,
  FetchState,
  HashTag
} from '../../../../constants';

import { bigNumberFormat, displayModal } from '../../../../functions';
import { connect } from 'react-redux';
import { dispatch } from '../../../../appStore';
import { getTrends } from '../../../../actions';

const HomeRightPane = ({
  trends: { status: trendsStatus, data: _trends }
}: {
  trends: FetchState<HashTag[]>;
}) => {
  useEffect(() => {
    dispatch(getTrends());
  }, []);

  const openQuestionModal = () => {
    displayModal(true, false, CREATE_QUESTION, { title: 'Ask A Question' });
  };

  return (
    <Container fluid className='right-pane'>
      <Col className='trending-container'>
        <h4>Trending</h4>
        {trendsStatus !== 'pending' && (
          <ul>
            {_trends?.map((topic: any, i: number) => (
              <Topic
                topic={topic.hashtag}
                key={i}
                numberOfDiscussions={topic.count}
              />
            ))}
          </ul>
        )}
        {_trends?.length === 0 && (
          <Box
            display='flex'
            justifyContent='center'
            color='#888'
            paddingY='2rem'>
            No trends!
          </Box>
        )}
        <hr id='divider' />
        <Button
          onClick={openQuestionModal}
          className='question-ask'
          color='primary'
          size='medium'
          variant='contained'>
          Ask Question
        </Button>
      </Col>
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

export default connect((state: { trends: FetchState<HashTag[]> }) => ({
  trends: state.trends
}))(HomeRightPane);
