import useApi from './base';
import { useApiResponse } from '../../constants';

// export const useFetchMentions = (keyword: string, token: string): any => {
//   let mentions: any = [];
//   axios({
//     url: `/colleagues/find?keyword=${keyword}`,
//     baseURL,
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${token}`,
//       Content_Type: 'application/json'
//     }
//   }).then(({ data }: any) => {
//     const { error, colleagues } = data as {
//       error: boolean;
//       colleagues: any[];
//     };
//     if (!error) {
//       for (let mention of colleagues) {
//         mentions.push({
//           name: mention.username,
//           link: `/@${mention.username}`,
//           avatar: '/images/avatar-1.png'
//         });
//       }
//     }
//   });
//   return mentions;
// };

export const useSubmitPost = (
  post: any,
  token: string
): useApiResponse<any> => {
  console.log(token, post);
  const { text } = post as {
    text: string;
    mentions: Array<string> | undefined;
    hashtags: Array<string> | undefined;
  };

  const [...r] = useApi<any>(
    {
      endpoint: '/post/make',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    },
    { text }
  );
  return r;
};
