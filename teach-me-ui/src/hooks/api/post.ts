import { apiBaseURL as baseURL } from '../../constants';
import axios from 'axios';

export const useFetchMentions = (
  keyword: string,
  token: string
): any => {
  let mentions: any = [];
  axios({
    url: `/colleagues/find?keyword=${keyword}`,
    baseURL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content_Type': 'application/json'
    }
  }).then(({ data }: any) => {
      const { error, colleagues } = data as {
        error: boolean;
        colleagues: any[];
      };
      if (!error) {
        for (let mention of colleagues) {
          mentions.push({name: mention.username, link: `/@${mention.username}`, avatar: '/images/avatar-1.png'});
        }
      }
    }
  )
  return mentions;
}


export const useSubmitPost = (post: any, token: any) => {
  let responseData;
  const { text, mentions, hashtags } = post as {
    text: string;
    mentions: Array<string> | undefined;
    hashtags: Array<string> | undefined;
  }
  axios({
    url: 'post/make',
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content_Type': 'application/json'
    },
    data: {
      text,
      mentions,
      hashtags
    }
  }).then(({ data }) => {
    responseData = data
  })
  return responseData;
}