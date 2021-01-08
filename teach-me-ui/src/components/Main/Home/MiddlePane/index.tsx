import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';

import Post from './Post';
import Compose from './Compose';
import Recommendations from './Recommendations';

import {
  PostStateProps,
  UserData,
  SendReplyProps,
  AuthState,
  FetchState
} from '../../../../constants';

import { getState, dispatch } from '../../../../functions';

import { getPosts, getRecommendations } from '../../../../actions';

interface HomeMiddlePaneProps {
  auth: AuthState;
  profileData: FetchState<UserData[]>;
  posts: FetchState<PostStateProps[]>;
  userData: UserData;
  recommendations: FetchState<UserData[]>;
  type: 'FEED' | 'WALL';
}

const HomeMiddlePane = (props: HomeMiddlePaneProps) => {
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
    recommendations,
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
            const data: SendReplyProps = {
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

      if (type === 'FEED') {
        dispatch(getRecommendations());
      }
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
        <Recommendations recommendations={recommendations} />
      )}
      {postStatus !== 'pending' &&
        postsData?.map((post, i: number) => {
          const renderRecommendations = !inProfile &&
            (i === 2 || (i > 0 && i % 15 === 0)) && (
              <Recommendations recommendations={recommendations} />
            );
          const nReposts = post.reposts?.length;

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

const mapStateToProps = (state: HomeMiddlePaneProps) => ({
  auth: state.auth,
  posts: state.posts,
  recommendations: state.recommendations,
  profileData: state.profileData,
  userData: state.userData
});

export default connect(mapStateToProps)(HomeMiddlePane);
