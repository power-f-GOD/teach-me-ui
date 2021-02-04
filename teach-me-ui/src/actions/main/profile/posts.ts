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
  http
} from '../../../functions';
import { updatePost } from '../../../utils/posts';

export const getProfilePosts = (
  userId: string,
  update = false,
  statusText?: string,
  url?: string
) => (dispatch: Function): ReduxActionV2<any> => {
  const payload = {
    status: 'pending',
    statusText,
    err: false,
    data: []
  } as FetchState<PostStateProps[]>;
  let offset = getState().profilePosts.extra;

  if (update) delete payload.status;

  dispatch(profilePosts(payload));
  checkNetworkStatusWhilstPend({
    name: 'profilePosts',
    func: profilePosts
  });

  http
    .get<PostStateProps[]>(
      url
        ? `${url.replace(/(offset=)(.*)/, `$1${offset}&limit=4`)}`
        : `/profile/${userId}/posts?limit=4`,
      true
    )
    .then(({ error: err, message, data }) => {
      offset = data?.slice(-1)[0]?.date ?? Date.now(); //'extra', here, is 'offset' for purpose of recycling

      let finalData = {
        data,
        extra: offset
      };

      if (err) finalData = {} as any;

      dispatch(
        profilePosts({
          status: err ? 'settled' : 'fulfilled',
          statusText: !data.length ? 'has reached end' : !err ? '' : message,
          err,
          ...finalData
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
