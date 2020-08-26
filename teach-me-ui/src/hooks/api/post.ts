import { useCallback } from 'react';

import useApi from './base';
import { useApiResponse, Post } from '../../constants';

const cookieEnabled = navigator.cookieEnabled;

let token = '';
if (cookieEnabled) {
  token = JSON.parse(localStorage?.kanyimuta ?? '{}')?.token ?? null;
}

const useFetchMentions = (keyword: string): useApiResponse<any> => {
  const [...r] = useApi<any>({
    endpoint: `/colleagues/find?keyword=${keyword}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  return r;
};

export const useFetchHashtags = (keyword: string): useApiResponse<any> => {
  const [...r] = useApi<any>({
    endpoint: `/hashtag/suggest?keyword=${keyword}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  return r;
};

export const useSubmitPost = (post: Post): useApiResponse<any> => {
  const [...r] = useApi<any>(
    {
      endpoint: '/post/make',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    },
    post
  );
  return r;
};

export const useGetFormattedMentionsWithKeyword = (keyword: string) => {
  const [getMentions, , isLoading] = useFetchMentions(keyword);
  const callback = useCallback(async () => {
    let mention: any[] = [];
    getMentions().then((response: any) => {
      if (!isLoading) {
        const { error, colleagues } = response as {
          error: boolean;
          colleagues: any[];
        };
        if (!error) {
          for (let colleague of colleagues) {
            mention.push({
              name: colleague.username,
              link: `/@${colleague.username}`,
              avatar: '/images/avatar-1.png'
            });
          }
        }
      }
    });
    return mention;
  }, [getMentions, isLoading]);
  return [callback];
};

export const useGetRecommendations = () => {
  const r = useApi<any>(
    {
      endpoint: `/people/recommendations`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    },
    {},
    false
  );
  return r;
};
