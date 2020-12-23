import React, { useEffect, useMemo } from 'react';

import Container from 'react-bootstrap/Container';

import Post from '../crumbs/Post';
import Compose from '../crumbs/Compose';
import Recommendations from '../crumbs/Recommendations';

import {
  PostPropsState,
  UserData,
  SocketProps,
  AuthState,
  FetchState
} from '../../constants';

import { getState, dispatch } from '../../functions';

import { connect } from 'react-redux';
import { getPosts } from '../../actions';

interface MiddlePaneProps {
  auth: AuthState;
  profileData: FetchState<UserData[]>;
  posts: FetchState<PostPropsState[]>;
  userData: UserData;
  type: 'FEED' | 'WALL';
}

const MiddlePane: React.FunctionComponent<MiddlePaneProps> = (props) => {
  const {
    auth: { isAuthenticated },
    profileData: {
      data: [profile]
    },
    posts: {
      status: postStatus,
      data: postsData,
      statusText: postsStatusText,
      err: postsErred
    },
    userData
  } = props;
  const isFetching = /(updat|fetch|recycl)(e|ing)?/i.test(
    postsStatusText || ''
  );
  const username = userData.username || '';
  let profileUsername = profile.username || '';
  // here is where the current user profile check is made to render the views accordingly
  const isSelf =
    !!username && !!profileUsername && profileUsername === username;
  const postElements = document.querySelectorAll('.Post');
  let selfView = isAuthenticated ? isSelf : false;
  let inProfile = /@\w+/.test(window.location.pathname);
  const postsDataLength = postsData?.length;

  const config: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: [0.5, 1]
  };

  const observer = useMemo(
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

  useEffect(() => {
    const type = props.type || 'FEED';
    const userId = (profile as UserData).id || undefined;

    if (!postsData?.length) {
      dispatch(getPosts(type, userId, !!postsData?.length));
    }
    // eslint-disable-next-line
  }, [props.type]);

  useEffect(() => {
    if (props.type === 'FEED') {
      postElements.forEach((post) => {
        observer.observe(post);
      });
    }
    // eslint-disable-next-line
  }, [postElements.length, props.type]);

  useEffect(() => {
    if (postStatus !== 'pending') {
      document.body.style.overflow =
        postsDataLength && !/chat/.test(window.location.search)
          ? 'auto'
          : 'hidden';
    }
  }, [postStatus, postsDataLength]);

  return (
    <Container className='middle-pane px-0' fluid>
      {(selfView || !inProfile) && <Compose userData={userData} />}
      {!inProfile && !postsData?.length && postStatus === 'fulfilled' && (
        <Recommendations />
      )}
      {postStatus !== 'pending' &&
        postsData?.map((post, i: number) => {
          const renderRecommendations = !inProfile &&
            (i === 3 || (i > 0 && i % 20 === 0)) && <Recommendations />;
            
          const nReposts = post.repost_count;

          return (
            <React.Fragment key={i}>
              {nReposts === 1 ? (
                <Post {...post.reposts[0]} quote={{ ...post }} />
              ) : (
                <Post {...post} />
              )}
              {renderRecommendations}
            </React.Fragment>
          );
        })}
      {postStatus === 'pending' &&
        Array.from({
          length: Math.floor(window.innerHeight / 450)
        }).map((_, i) => <Post key={i} index={i} />)}
      {(isFetching || postsErred) &&
        Array.from({ length: 2 }).map((_, i) => (
          <Post key={i} index={i} postsErred={postsErred} />
        ))}
    </Container>
  );
};

const mapStateToProps = (state: any, ownProps: any) => ({
  ...ownProps,
  auth: state.auth,
  posts: state._posts,
  profileData: state.profileData,
  userData: state.userData
});

export default connect(mapStateToProps)(MiddlePane);
