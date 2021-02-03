import { SET_FEEDS_POSTS, GET_FEEDS_POSTS } from '../../../constants';
import { PostStateProps, FetchState, ReduxActionV2 } from '../../../types';
import {
  getState,
  checkNetworkStatusWhilstPend,
  logError,
  http
} from '../../../functions';
import { updatePost } from '../../../utils/posts';

export const getPosts = (update = false, statusText?: string, url?: string) => (
  dispatch: Function
): ReduxActionV2<any> => {
  const payload = {
    status: 'pending',
    statusText,
    err: false
  } as FetchState<PostStateProps[]>;
  let offset = getState().posts.extra;

  if (update) delete payload.status;

  dispatch(posts(payload));
  checkNetworkStatusWhilstPend({
    name: 'posts',
    func: posts
  });

  http
    .get<PostStateProps[]>(
      url
        ? `${url.replace(/(offset=)(.*)/, `$1${offset}&limit=4`)}`
        : '/feed?limit=4',
      true
    )
    .then(({ error, message, data }) => {
      const isRecycling = /recycl(e|ing)/i.test(statusText || '');
      const isFetching = /fetching/i.test(statusText || '');
      offset = data?.slice(-1)[0]?.date ?? Date.now();

      console.log(
        'offset:',
        offset,
        '\n\n',
        'data returned from server:',
        data,
        '\n\n',
        'statusText:',
        statusText
      );

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
            extra: offset //'extra', here, is 'offset' for purpose of recycling
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
    payload: updatePost(_payload)
  };
};
