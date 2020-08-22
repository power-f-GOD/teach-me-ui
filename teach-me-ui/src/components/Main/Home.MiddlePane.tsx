import React, { useEffect } from 'react';

import Container from 'react-bootstrap/Container';

import Post from '../crumbs/Post';
import Compose from '../crumbs/Compose';

import { PostPropsState, UserData } from '../../constants';

import { fetchPostsFn } from '../../functions';

import { connect } from 'react-redux';

const MiddlePane: React.FunctionComponent = (props: any) => {
  const {
    auth: { isAuthenticated },
    profileData: {
      data: [profile]
    }
  } = props;
  const username = props.userData.username || '';

  let profileUsername = profile.username || '';
  // here is where the check is made to render the views accordingly
  const isSelf =
    !!username && !!profileUsername && profileUsername === username;
  let selfView = isAuthenticated ? isSelf : false;
  let inProfile = /@\w+/.test(window.location.pathname);
  useEffect(() => {
    const type = props.type || 'FEED';
    const userId = (profile as UserData).id || undefined;
    fetchPostsFn(type, userId);
    // eslint-disable-next-line
  }, []);
  return (
    <Container className='middle-pane' fluid>
      {(selfView || !inProfile) && <Compose />}
      {props.fetchPostStatus.status === 'resolved' &&
        props.posts.map((post: PostPropsState, i: number) => (
          <Post {...post} key={i} />
        ))}
      {props.fetchPostStatus.status === 'pending' &&
        Array.from({ length: 4 }).map((_, i) => <Post key={i} />)}
    </Container>
  );
};

const mapStateToProps = (
  { posts, fetchPostStatus, profileData, auth, userData }: any,
  ownProps: any
) => ({
  ...ownProps,
  auth,
  posts,
  fetchPostStatus,
  profileData,
  userData
});

export default connect(mapStateToProps)(MiddlePane);
