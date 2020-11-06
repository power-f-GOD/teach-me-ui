import React, { useEffect } from 'react';

import Container from 'react-bootstrap/Container';

import Post from '../crumbs/Post';
import Compose from '../crumbs/Compose';
import Recommendations from '../crumbs/Recommendations';

import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

import { PostPropsState, UserData, SocketProps } from '../../constants';

import { fetchPostsFn, getState } from '../../functions';

import { connect } from 'react-redux';
import { Reply } from '../crumbs/Post.crumbs';

const MiddlePane: React.FunctionComponent = (props: any) => {
  const {
    auth: { isAuthenticated },
    profileData: {
      data: [profile]
    }
  } = props;
  const config: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: [0.5, 1]
  };
  const observer = React.useMemo(
    () =>
      new IntersectionObserver((entries, self) => {
        const socket = getState().webSocket as WebSocket;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            const data: SocketProps = {
              pipe: 'POST_INTERACTION',
              post_id: entry.target.id,
              interaction: 'SEEN'
            };
            if (socket.readyState === 1) {
              socket.send(JSON.stringify(data));
            }
          }
        });
      }, config),
    // eslint-disable-next-line
    []
  );
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
  }, [props.type]);
  const posts = document.querySelectorAll('.Post');
  useEffect(() => {
    if (props.type === 'FEED') {
      posts.forEach((post) => {
        observer.observe(post);
      });
    }
    // eslint-disable-next-line
  }, [posts.length, props.type]);

  return (
    <Container className='middle-pane px-0' fluid>
      {(selfView || !inProfile) && <Compose />}
      {!inProfile && <Recommendations />}
      {props.fetchPostStatus.status === 'resolved' &&
        props.posts.map((post: PostPropsState, i: number) => {
          switch (post.sec_type) {
            case 'REPLY':
              return (
                <React.Fragment key={i}>
                  <Post {...post.parent} />
                  <Reply
                    {...post}
                    repostMeta={{ ...post, parent: undefined }}
                  />
                </React.Fragment>
              );
            default:
              return <Post {...post} key={i} />;
          }
        })}
      {props.fetchPostStatus.status === 'pending' &&
        Array.from({ length: 4 }).map((_, i) => <Post key={i} />)}
      {props.isFetching && (
        <Box textAlign='center' py='2'>
          <CircularProgress />
        </Box>
      )}
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
