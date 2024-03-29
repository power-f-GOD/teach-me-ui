import React, { useEffect } from 'react';

// import Box from '@material-ui/core/Box';

import Container from 'react-bootstrap/Container';

import Post from './MiddlePane/Post';

import { connect } from 'react-redux';

import { fetchPostRequest, fetchReplies } from '../../../actions';

import { Redirect } from 'react-router-dom';

import { dispatch } from '../../../functions';

const PostPage = (props: {
  location: Location;
  match: any;
  // posts: FetchState<PostStateProps[]>;
  fetchPost: any;
  fetchReplies: any;
}) => {
  const { match, fetchPost, fetchReplies: fetchRepliesProps, location } = props;

  useEffect(() => {
    dispatch(fetchReplies({ data: []}));
  }, [match.params.id]);

  // const { status: postsStatus } = posts;
  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchPostRequest(match.params.id));
  }, [match.params.id]);

  useEffect(() => {
    document.body.classList.add('is-dedicated');

    return () => document.body.classList.remove('is-dedicated');
  }, [location.pathname]);

  if (fetchPost.err) {
    return <Redirect to='/404' />;
  }


  return (
    <>
      <Container className='p-0 fade-in'>
        <Post head {...{ ...fetchPost.data, 
          repliesStatus: fetchRepliesProps.status, 
          replyStatusText: fetchRepliesProps.statusText ,
          postStatus: fetchPost.status
        }} />
      </Container>
    </>
  );
};

const mapStateToProps = ({ fetchPost, fetchReplies }: any, ownProps: any) => ({
  ...ownProps,
  fetchPost,
  fetchReplies
});

export default connect(mapStateToProps)(PostPage);
