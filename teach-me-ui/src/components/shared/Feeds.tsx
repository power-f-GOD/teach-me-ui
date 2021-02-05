import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';

import Post from '../Main/Home/MiddlePane/Post';
import Compose from '../Main/Home/MiddlePane/Compose';
import Recommendations from '../Main/Home/MiddlePane/Recommendations';

import { PostStateProps, UserData, AuthState, FetchState } from '../../types';

import { dispatch, createObserver } from '../../functions';

import {
  getPosts,
  getRecommendations,
  posts,
  profilePosts
} from '../../actions';
import { POSTS_ANCHOR__PROFILE } from '../../constants';
import { getProfilePosts } from '../../actions/main/profile/posts';
import Empty from './Empty';
import createMemo from '../../Memo';

interface FeedsProps {
  auth?: AuthState;
  anchorPosts: FetchState<PostStateProps[]>;
  anchorProfileData?: FetchState<UserData>;
  userData: UserData;
  recommendations?: FetchState<UserData[]>;
  className?: string;
  anchor: 'HOME' | 'PROFILE';
  webSocket: WebSocket;
}

const Memoize = createMemo();

const feedsScrollObservedElemRef = React.createRef<any>();

//used/observed to load/fetch more posts when it is intersecting via the IntersectionObserver
let feedsScrollObservedElem: HTMLElement | null = null;

let observer: IntersectionObserver;

const Feeds = (props: FeedsProps) => {
  const {
    auth,
    anchorProfileData: anchorUserData,
    anchorPosts: {
      status: anchPostsStatus,
      data: anchPostsData,
      statusText: anchPostsStatusText,
      err: anchPostsErred,
      extra: anchPostsExtra
    },
    userData,
    recommendations,
    className,
    anchor,
    webSocket: socket
  } = props;
  const { isAuthenticated } = auth || {};
  const { data: profile } = anchorUserData || {};
  const inProfile = anchor === POSTS_ANCHOR__PROFILE;
  const username = userData!.username || '';
  const profileIdOrUsername = profile?.username || profile?.id || '';
  const anchPostsIsPending = anchPostsStatus === 'pending';
  const anchPostsLength = anchPostsData?.length;
  const anchPostsUrl = anchPostsExtra
    ? inProfile
      ? `/profile/${profileIdOrUsername}/posts?limit=10&offset=`
      : `/feed?recycle=true&offset=`
    : undefined;
  const isFetching =
    /(updat|fetch|recycl|gett)(e|ing)?/i.test(anchPostsStatusText || '') ||
    anchPostsIsPending;
  const reachedEnd = /reached\send/.test(anchPostsStatusText || '');
  //currently viewed user profile check
  const isSelf =
    !!username && !!profileIdOrUsername && profileIdOrUsername === username;
  const selfView = isAuthenticated ? isSelf : false;
  const dataIsEmpty = !anchPostsData?.length && anchPostsStatus === 'fulfilled';

  useEffect(() => {
    feedsScrollObservedElem = feedsScrollObservedElemRef.current;

    return () => {
      if (!inProfile) {
        dispatch(posts({ statusText: 'feeds unmounts' }));
      } else {
        dispatch(profilePosts({ statusText: 'feeds unmounts' }));
      }
    };
  }, [inProfile, profileIdOrUsername]); // require profileUsername for unmount; do not remove

  useEffect(() => {
    if (/(new\s)?post\screated/.test(anchPostsStatusText || '')) {
      window.scrollTo(0, 0);
    }
  }, [anchPostsStatusText]);

  useEffect(() => {
    if (!inProfile) {
      if (!anchPostsLength && !isFetching) {
        dispatch(getPosts(!!anchPostsLength));
        dispatch(getRecommendations());
      }
    } else {
      if (profileIdOrUsername && !anchPostsLength && !isFetching) {
        dispatch(getProfilePosts(profileIdOrUsername, 'getting new posts'));
      }
    }
    //eslint-disable-next-line
  }, [inProfile, profileIdOrUsername, anchPostsLength]);

  useEffect(() => {
    if (feedsScrollObservedElem) {
      observer = createObserver(
        null,
        (entries) => {
          const entry = entries[0];
          const statusText = 'fetching more posts';

          if (
            entry.isIntersecting &&
            !isFetching &&
            !reachedEnd &&
            !anchPostsErred &&
            navigator.onLine
          ) {
            if (!inProfile) {
              dispatch(getPosts(true, statusText, anchPostsUrl));
            } else if (profileIdOrUsername) {
              dispatch(
                getProfilePosts(profileIdOrUsername, statusText, anchPostsUrl)
              );
            }
          }
        },
        { threshold: [0.01] }
      );

      observer?.observe(feedsScrollObservedElem);
    }

    return () => {
      observer?.unobserve(feedsScrollObservedElem as Element);
    };
  }, [
    anchPostsErred,
    anchPostsStatus,
    anchPostsUrl,
    anchPostsIsPending,
    inProfile,
    profileIdOrUsername,
    isFetching,
    reachedEnd,
    socket
  ]);

  return (
    <>
      <Container
        className={`Feeds middle-pane px-0 px-sm-3 px-md-0 ${className}`}
        fluid>
        {(selfView || !inProfile) && (
          <Memoize
            memoizedComponent={Compose}
            userData={userData!}
            className={`${inProfile ? 'no-shadow no-hang-in' : ''}`}
          />
        )}
        {recommendations && dataIsEmpty && (
          <Memoize
            memoizedComponent={Recommendations}
            recommendations={recommendations}
          />
        )}
        {!anchPostsIsPending &&
          anchPostsData?.map((post, i) => {
            const shouldRenderRecommendations =
              recommendations && (i === 2 || (i > 0 && i % 15 === 0));

            return (
              <React.Fragment key={i}>
                <Memoize
                  memoizedComponent={Post}
                  {...post}
                  userId={profile?.id || userData!.id}
                  webSocket={socket}
                  forceUpdate={post.colleague_replies
                    ?.concat(post.colleague_reposts)
                    .map((entity) => entity.reaction)
                    .join('')}
                />
                {shouldRenderRecommendations && (
                  <Memoize
                    memoizedComponent={Recommendations}
                    recommendations={recommendations!}
                  />
                )}
              </React.Fragment>
            );
          })}
        {/* Skeleton Loader */}
        {(isFetching || anchPostsErred) &&
          Array.from({
            length: anchPostsIsPending
              ? Math.floor(window.innerHeight / 200)
              : 2
          }).map((_, i) => (
            <Memoize
              memoizedComponent={Post}
              key={i}
              index={i}
              postsErred={anchPostsErred}
            />
          ))}
        {(dataIsEmpty || reachedEnd) && !isFetching && (
          <Empty
            headerText={dataIsEmpty ? 'No Posts' : 'No more Posts'}
            riderText={
              inProfile
                ? dataIsEmpty
                  ? 'Nothing to show here.'
                  : "That's all we could find."
                : "You're all caught up!"
            }
            imageWidth='60%'
            action={
              !inProfile
                ? {
                    func: () => {
                      window.scrollTo(0, 0);
                      dispatch(getPosts(false, undefined, anchPostsUrl));
                    }
                  }
                : undefined
            }
          />
        )}
      </Container>
      <Container
        className='feeds-scroll-observer py-2'
        ref={feedsScrollObservedElemRef}></Container>
    </>
  );
};

const mapStateToProps = (state: FeedsProps) => ({
  auth: state.auth,
  userData: state.userData,
  webSocket: state.webSocket
});

export default connect(mapStateToProps)(Feeds);
