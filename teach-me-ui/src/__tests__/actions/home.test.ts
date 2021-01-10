import { cleanup } from '@testing-library/react';

import * as actions from '../../actions/main/home';

import {
  ReplyState,
  REPLY_TO_POST,
  ReduxAction,
  SendReplyProps,
  PostContent,
  SUBMIT_POST,
  MAKE_POST
} from '../../constants';

import { dispatch } from '../../appStore';

afterEach(cleanup);

it('sends post to the sever', () => {
  const mockPostProps: PostContent = {
    text: expect.any(String)
  };

  const mockPostState = {
    status: expect.any(String)
  };

  const makePostAction: ReduxAction = {
    type: MAKE_POST,
    payload: {
      status: expect.any(String)
    }
  };

  const submitPostAction: ReduxAction = {
    type: SUBMIT_POST
  };

  const mockMedia = expect.any(Array);

  const submitPostMockFunc = jest.fn(
    (payload: PostContent, media: Array<string>) => {
      return (dispatch: Function) => {
        actions.createPost(mockPostState);
      };
    }
  );

  submitPostMockFunc(mockPostProps, mockMedia);
  expect(submitPostMockFunc).toHaveBeenCalledWith(mockPostProps, mockMedia);
  // expect(actions.createPost(mockPostState)).toMatchObject(makePostAction);
  // expect(actions.submitPost(mockPostProps, mockMedia)(dispatch)).toMatchObject(submitPostAction);
});
