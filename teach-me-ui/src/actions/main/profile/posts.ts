import {
  GET_FEEDS_POSTS,
  SET_PROFILE_POSTS,
  POSTS_ANCHOR__PROFILE
} from '../../../constants';
import { PostStateProps, FetchState, ReduxActionV2 } from '../../../types';

import {
  getState,
  checkNetworkStatusWhilstPend,
  logError,
  http,
  isAuthenticated
} from '../../../functions';
import { updatePost } from '../../../utils/posts';

export const getProfilePosts = (
  userId: string,
  statusText?: string,
  url?: string
) => (dispatch: Function): ReduxActionV2<any> => {
  let { extra: offset } = getState().profilePosts as FetchState<PostStateProps>;
  let isGettingNew = /getting\s?new/.test(statusText || '');
  const limit = 5;

  dispatch(
    profilePosts({
      ...(isGettingNew ? { status: 'pending', data: [] } : {}),
      statusText,
      err: false
    })
  );
  checkNetworkStatusWhilstPend({
    name: 'profilePosts',
    func: profilePosts
  });

  http
    .get<PostStateProps[]>(
      url
        ? `${url.replace(/(offset=)(.*)/, `$1${offset}`)}`
        : `/profile/${userId}/posts?limit=${limit}`,
      isAuthenticated()
    )
    .then(({ error: err, message, data }) => {
      offset = data?.slice(-1)[0]?.date || offset || Date.now();

      dispatch(
        profilePosts({
          status: err ? 'settled' : 'fulfilled',
          statusText: !data?.length ? 'has reached end' : !err ? '' : message,
          err,
          ...(!err ? { data } : {}),
          extra: offset //'extra', here, is 'offset' for purpose of recycling
        })
      );
    })
    .catch(logError(profilePosts));

  return {
    type: GET_FEEDS_POSTS
  };
};

export const profilePosts = (
  _payload: FetchState<PostStateProps[], number>
) => {
  return {
    type: SET_PROFILE_POSTS,
    payload: updatePost(_payload, POSTS_ANCHOR__PROFILE)
  };
};
