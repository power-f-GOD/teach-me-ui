import React from 'react';

// import Box from '@material-ui/core/Box';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';

import HomeRightPane from './RightPane';
import Post from './MiddlePane/Post';
import Loader from '../../shared/Loaders';

import { connect } from 'react-redux';

import { fetchReplies, fetchPost } from '../../../actions';

import { Redirect } from 'react-router-dom';

import { dispatch } from '../../../functions';
import { PostStateProps, FetchState } from '../../../types';

const PostPage = (props: {
  match: any;
  posts: FetchState<PostStateProps[]>;
  fetchSinglePostStatus: any;
  post: any;
}) => {
  const { match, fetchSinglePostStatus } = props;
  // const { status: postsStatus } = posts;

  React.useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchPost(match.params.id));
  }, [match.params.id]);

  if (fetchSinglePostStatus === 'pending') {
    return <Loader />;
  }
  if (fetchSinglePostStatus === 'rejected') {
    return <Redirect to='/' />;
  }
  return (
    <>
      <Container className='Home fade-in'>
        <Row className='flex-row m-2 justify-content-between'>
          <Col lg={9} md={9} className='middle-pane-col pr-2'>
            <Post head {...{ ...props.post, sec_type: undefined }} />
            <Replies id={props.match.params.id} />
          </Col>
          <Col lg={3} className='d-none d-lg-block right-pane-col'>
            <HomeRightPane />
          </Col>
        </Row>
      </Container>
    </>
  );
};

const RepliesBase = (props: any) => {
  React.useEffect(() => {
    dispatch(fetchReplies(props.id));
  }, [props.id]);
  return (
    <Box ml={5}>
      {props.fetchPostStatus.status === 'resolved' &&
        props.posts.map((reply: any, i: number) => {
          return <Post key={i} {...{ ...reply, sec_type: undefined }} />;
        })}
      {props.fetchPostStatus.status === 'pending' &&
        Array.from({ length: 4 }).map((_, i) => <Post key={i} />)}
    </Box>
  );
};

const mapStateToProps = (state: any, ownProps: any) => ({
  ...ownProps,
  posts: state.posts
});

const Replies = connect(mapStateToProps)(RepliesBase);

export default connect(
  ({ singlePost, fetchSinglePostStatus }: any, ownProps: any) => ({
    ...ownProps,
    post: singlePost,
    fetchSinglePostStatus
  })
)(PostPage);