import { SET_FEEDS_POSTS, GET_FEEDS_POSTS } from '../../../constants';
import { PostStateProps, FetchState, ReduxActionV2 } from '../../../types';
import {
  getState,
  checkNetworkStatusWhilstPend,
  logError,
  http
} from '../../../functions';
import { updatePosts } from '../../../utils/posts';

export const getPosts = (update = false, statusText?: string, url?: string) => (
  dispatch: Function
): ReduxActionV2<any> => {
  const { posts: _posts } = getState() as {
    posts: FetchState<PostStateProps[]>;
  };
  const isFetching = /fetching/i.test(statusText || '');
  const limit = isFetching ? 8 : 4;
  const offset = _posts.data?.length && update ? _posts.extra : Date.now();

  dispatch(
    posts({
      status: update ? 'fulfilled' : 'pending',
      statusText,
      err: false
    })
  );
  checkNetworkStatusWhilstPend({
    name: 'posts',
    func: posts
  });

  http
    .get<PostStateProps[]>(
      url
        ? `${'/feed?recycle=true&offset='.replace(
            /(offset=)(.*)/,
            `$1${offset || Date.now()}&limit=${limit}`
          )}`
        : `/feed?limit=${limit}`,
      true
    )
    .then(({ error, message, data, meta }) => {
      const isRecycling = /recycl(e|ing)/i.test(statusText || '');

      if (error) {
        dispatch(posts({ status: 'settled', statusText: message, err: true }));
      } else {
        if (isRecycling && !data.length) {
          return dispatch(
            posts({
              status: 'fulfilled',
              statusText: 'has reached end'
            })
          );
        }

        if (!data.length) {
          // recursively get (recycled) Posts if no post is returned
          if (!isRecycling && isFetching) {
            dispatch(
              getPosts(
                update,
                'fetching recycled posts',
                `/feed?recycle=true&offset=`
              )
            );

            return;
          }
        }

        dispatch(
          posts({
            status: 'fulfilled',
            statusText: '',
            err: false,
            data,
            extra: meta?.offset //'extra', here, is 'offset' for purpose of recycling
          })
        );
      }
    })
    .catch(logError(posts));

  return {
    type: GET_FEEDS_POSTS
  };
};

export const posts = (_payload: FetchState<PostStateProps[], number>) => {
  return {
    type: SET_FEEDS_POSTS,
    payload: updatePosts(_payload)
  };
};
