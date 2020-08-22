import React from 'react';

// import Box from '@material-ui/core/Box';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

import ModalFrame from '../crumbs/modals';
import RightPane from './Home.RightPane';
import Post from '../crumbs/Post';
import Loader from '../crumbs/Loader';

import { useGetPost, useGetPostReplies } from '../../hooks/api';

import { Redirect } from 'react-router-dom';

const PostPage = (props: any) => {
  React.useEffect(() => () => window.scrollTo(0, 0), []);
  const [, post, getPostIsLoading] = useGetPost(props.match.params.id);

  if (post === null || getPostIsLoading) {
    return <Loader />;
  }
  if (post !== null && post.error === true) {
    return <Redirect to='/' />;
  }
  return (
    <>
      <ModalFrame />
      <Container fluid className='Home p-0 fade-in'>
        <Row className='flex-row m-2 justify-content-between'>
          <Col lg={9} md={9} className='middle-pane-col pr-2'>
            <Post head {...{ ...post, sec_type: undefined }} />
            <Replies id={props.match.params.id} />
          </Col>
          <Col lg={3} className='d-none d-lg-block right-pane-col'>
            <RightPane />
          </Col>
        </Row>
      </Container>
    </>
  );
};

const Replies = (props: any) => {
  const [, getRepliesResult, getRepliesIsLoading] = useGetPostReplies(props.id);
  return (
    <Box ml={5}>
      {getRepliesResult !== null && !getRepliesIsLoading ? (
        getRepliesResult.replies.map((reply: any, i: number) => {
          return <Post {...{ ...reply, sec_type: undefined }} />;
        })
      ) : (
        <CircularProgress color='inherit' size={15} />
      )}
    </Box>
  );
};

export default PostPage;
