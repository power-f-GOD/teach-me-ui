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
} from '../../../../types';

import { getState, dispatch } from '../../../../functions';

import { getPosts, getRecommendations } from '../../../../actions';

interface HomeMiddlePaneProps {
  auth: AuthState;
  profileData: FetchState<UserData>;
  posts: FetchState<PostStateProps[]>;
  userData: UserData;
  recommendations: FetchState<UserData[]>;
  type: 'FEED' | 'WALL';
}

const HomeMiddlePane = (props: HomeMiddlePaneProps) => {
  const {
    auth: { isAuthenticated },
    profileData: { data: profile },
    posts: {
      status: postsStatus,
      data: postsData,
      statusText: postsStatusText,
      err: postsErred
    },
    recommendations,
    userData,
    type: _type
  } = props;

  const postsIsPending = postsStatus === 'pending';
  const isFetching =
    /(updat|fetch|recycl)(e|ing)?/i.test(postsStatusText || '') ||
    postsIsPending;
  const username = userData.username || '';
  let profileUsername = profile?.username || '';
  // here is where the current user profile check is made to render the views accordingly
  const isSelf =
    !!username && !!profileUsername && profileUsername === username;
  const postElements = document.querySelectorAll('.Post');
  let selfView = isAuthenticated ? isSelf : false;
  let inProfile = /\/(@\w+|profile\/.+)/.test(window.location.pathname);
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
    if (/(new\s)?post\screated/.test(postsStatusText || '')) {
      window.scrollTo(0, 0);
    }
  }, [postsStatusText]);

  useEffect(() => {
    const type = _type || 'FEED';
    const userId = (profile as UserData).id || undefined;

    if (!postsData?.length) {
      dispatch(getPosts(type, userId, !!postsData?.length));

      if (type === 'FEED') {
        dispatch(getRecommendations());
      }
    }
    // eslint-disable-next-line
  }, [_type]);

  useEffect(() => {
    if (_type === 'FEED') {
      postElements.forEach((post) => {
        observer.observe(post);
      });
    }
    // eslint-disable-next-line
  }, [postElements.length, _type]);

  return (
    <Container className='middle-pane px-0 px-sm-3 px-md-0' fluid>
      {(selfView || !inProfile) && <Compose userData={userData} />}
      {!inProfile && !postsData?.length && postsStatus === 'fulfilled' && (
        <Recommendations recommendations={recommendations} />
      )}
      {!postsIsPending &&
        postsData?.map((post, i: number) => {
          const renderRecommendations = !inProfile &&
            (i === 2 || (i > 0 && i % 15 === 0)) && (
              <Recommendations recommendations={recommendations} />
            );
          const nReposts = post.colleague_reposts?.length;

          return (
            <React.Fragment key={i}>
              {nReposts === 1 ? (
                <Post
                  {...post.colleague_reposts[0]}
                  quote={{ ...post }}
                  userId={userData.id}
                />
              ) : (
                <Post {...post} userId={userData.id} />
              )}
              {renderRecommendations}
            </React.Fragment>
          );
        })}

      {/* Skeleton Loader */}
      {(isFetching || postsErred || postsIsPending || !postsDataLength) &&
        Array.from({
          length: postsIsPending ? Math.floor(window.innerHeight / 200) : 2
        }).map((_, i) => (
          <Post
            key={i}
            index={i}
            postsErred={
              postsErred || (!postsDataLength && postsStatus === 'fulfilled')
            }
          />
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
