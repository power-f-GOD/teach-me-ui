import React, { useEffect } from 'react';

import Container from 'react-bootstrap/Container';

import Post from '../crumbs/Post';
import Compose from '../crumbs/Compose';

import { PostPropsState } from '../../constants';

import { fetchPostsFn } from '../../functions';

import { connect } from 'react-redux';

const MiddlePane: React.FunctionComponent = (props: any) => {
  useEffect(() => {
    fetchPostsFn();
  }, []);
  return (
    <Container className='middle-pane' fluid>
      <Compose />
      {props.fetchPostStatus.status === 'resolved' &&
        props.posts.map((post: PostPropsState, i: number) => (
          <Post {...post} id={i} key={i} />
        ))}
      {props.fetchPostStatus.status === 'pending' &&
        Array.from({ length: 4 }).map(() => <Post />)}
    </Container>
  );
};

const mapStateToProps = ({ posts, fetchPostStatus }: any) => ({
  posts,
  fetchPostStatus
});

export default connect(mapStateToProps)(MiddlePane);
