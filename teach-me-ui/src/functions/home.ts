import { displaySnackbar, fetchReplies } from '../actions';

import Axios from 'axios';

import { dispatch, getState } from '../utils';

import { apiBaseURL as baseURL, POST_REACTION, POST_REPLY } from '../constants';
import { PostStateProps, UserData } from '../types';

export const fetchMentionsFn = (value: string) => {
  const token = (getState().userData as UserData).token;
  return Axios({
    url: `/colleague/find?keyword=${value}`,
    method: 'GET',
    baseURL,
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => {
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      return response.data.data.colleagues;
    })
    .catch((e) => {
      dispatch(
        displaySnackbar({
          autoHide: true,
          open: true,
          message: e.message,
          severity: 'error'
        })
      );
    });
};

export const updatePostPage = (data: PostStateProps) => {
  switch (data.pipe) {
    case POST_REPLY:
      dispatch(fetchReplies({ data: [data] }, true));
      break;
    case POST_REACTION:
      
      // if (data.parent_id) {
      //   let finalReplies = []
      //   const { fetchReplies:repliesInState } = getState();
      //   let tempRepliesInState : Array<PostStateProps> = Array.from(repliesInState);
      //   for (let reply of tempRepliesInState) {
      //     if (reply.id === data.id) {
      //       switch (reply.reaction) {
      //         case 'UPVOTE':
                
      //           break;
      //         case 'DOWNVOTE':

      //           break;
      //         case 'NEUTRAL':

      //           break;
            
      //         default:
      //           break;
      //       }  
      //   }
      // } else {

      // }
      break;
    default:
      break;
  }
  
}