import { cleanup } from '@testing-library/react';

import {
  ReduxAction,
  MAKE_POST,
  REPLY_TO_POST,
  ReplyState,
  MakePostState,
  makePostState,
  replyState
} from '../../constants';

import { 
   makePost,
   replyToPost
} from '../../reducers/posts';


afterEach(cleanup);

it("post reducers should be called with 'state' and 'action' params and return value of initial state type.", () => {
  const mockPostState: MakePostState = {
    status: expect.any(String)
  };

  const mockReplyState: ReplyState = {
    status: expect.any(String),
    err: expect.any(Boolean),
    data: expect.any(Object)
  }

  const makePostAction: ReduxAction = {
    type: MAKE_POST,
    payload: {
      status: expect.any(String)
    }
  };

  const replyToPostAction: ReduxAction = {
    type: REPLY_TO_POST,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const makePostMockFunc = jest.fn((state: MakePostState, action: ReduxAction) =>
    makePost(state, action)
  );

  const replyToPostMockFunc = jest.fn((state: ReplyState, action: ReduxAction) =>
    replyToPost(state, action)
  );

  makePostMockFunc(makePostState, makePostAction);
  replyToPostMockFunc(replyState, replyToPostAction);
  expect(makePostMockFunc).toHaveBeenCalledWith(makePostState, makePostAction);
  expect(replyToPostMockFunc).toHaveBeenCalledWith(replyState, replyToPostAction);
  expect(makePost(makePostState, makePostAction)).toMatchObject(mockPostState);
  expect(replyToPost(replyState, replyToPostAction)).toMatchObject(mockReplyState);
});
