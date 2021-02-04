import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';

import Post from '../Main/Home/MiddlePane/Post';
import Compose from '../Main/Home/MiddlePane/Compose';
import Recommendations from '../Main/Home/MiddlePane/Recommendations';

import {
  PostStateProps,
  UserData,
  SendReplyProps,
  AuthState,
  FetchState
} from '../../types';

import { getState, dispatch } from '../../functions';

import { getPosts, getRecommendations } from '../../actions';
import { POSTS_ANCHOR__PROFILE } from '../../constants';
import { getProfilePosts } from '../../actions/main/profile/posts';

interface FeedsProps {
  auth?: AuthState;
  anchorPosts: FetchState<PostStateProps[]>;
  anchorProfileData?: FetchState<UserData>;
  userData: UserData;
  recommendations?: FetchState<UserData[]>;
  anchor: 'HOME' | 'PROFILE';
}

const Feeds = (props: FeedsProps) => {
  const {
    auth,
    anchorProfileData: anchorUserData,
    anchorPosts: {
      status: anchPostsStatus,
      data: anchPostsData,
      statusText: anchPostsStatusText,
      err: anchPostsErred
    },
    userData,
    recommendations,
    anchor
  } = props;
  const { isAuthenticated } = auth || {};
  const { data: profile } = anchorUserData || {};

  const anchPostsIsPending = anchPostsStatus === 'pending';
  const isFetching =
    /(updat|fetch|recycl)(e|ing)?/i.test(anchPostsStatusText || '') ||
    anchPostsIsPending;
  const username = userData!.username || '';
  const profileUsername = profile?.username || '';
  // here is where the current user profile check is made to render the views accordingly
  const isSelf =
    !!username && !!profileUsername && profileUsername === username;
  const anchPostElements = document.querySelectorAll('.Post');
  const selfView = isAuthenticated ? isSelf : false;
  const inProfile = anchor === POSTS_ANCHOR__PROFILE;
  const anchPostsDataLength = anchPostsData?.length;

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

            if (socket.readyState === socket.OPEN) {
              socket.send(JSON.stringify(data));
            }
          }
        });
      }, config),
    [config]
  );

  useEffect(() => {
    if (/(new\s)?post\screated/.test(anchPostsStatusText || '')) {
      window.scrollTo(0, 0);
    }
  }, [anchPostsStatusText]);

  useEffect(() => {
    if (!inProfile) {
      if (!anchPostsData?.length) {
        dispatch(getPosts(!!anchPostsData?.length));
        dispatch(getRecommendations());
      }
    } else {
      if (profileUsername) {
        dispatch(
          getProfilePosts(
            profileUsername,
            !!anchPostsData?.length,
            'getting new posts'
          )
        );
      }
    }
    // eslint-disable-next-line
  }, [!inProfile, profileUsername]);

  useEffect(() => {
    if (!inProfile) {
      anchPostElements.forEach((post) => {
        observer.observe(post);
      });
    }
    // eslint-disable-next-line
  }, [anchPostElements, inProfile]);

  return (
    <>
      <Container className='middle-pane px-0 px-sm-3 px-md-0' fluid>
        {(selfView || !inProfile) && (
          <Compose
            userData={userData!}
            className={`${inProfile ? 'no-shadow no-hang-in' : ''}`}
          />
        )}
        {recommendations &&
          !anchPostsData?.length &&
          anchPostsStatus === 'fulfilled' && (
            <Recommendations recommendations={recommendations} />
          )}
        {!anchPostsIsPending &&
          anchPostsData?.map((post: any, i: number) => {
            const shouldRenderRecommendations =
              recommendations && (i === 2 || (i > 0 && i % 15 === 0));

            return (
              <React.Fragment key={i}>
                <Post {...post} userId={profile?.id || userData!.id} />
                {shouldRenderRecommendations && (
                  <Recommendations recommendations={recommendations!} />
                )}
              </React.Fragment>
            );
          })}

        {/* Skeleton Loader */}
        {(isFetching ||
          anchPostsErred ||
          anchPostsIsPending ||
          !anchPostsDataLength) &&
          Array.from({
            length: anchPostsIsPending
              ? Math.floor(window.innerHeight / 200)
              : 2
          }).map((_, i) => (
            <Post
              key={i}
              index={i}
              postsErred={
                anchPostsErred ||
                (!anchPostsDataLength && anchPostsStatus === 'fulfilled')
              }
            />
          ))}
      </Container>
      {/* <Container
        className='feeds-scroll-observer py-2'
        ref={feedsScrollObservedElemRef}></Container> */}
    </>
  );
};

const mapStateToProps = (state: FeedsProps) => ({
  auth: state.auth,
  userData: state.userData
});

export default connect(mapStateToProps)(Feeds);
