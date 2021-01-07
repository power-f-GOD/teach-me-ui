import { cleanup } from '@testing-library/react';

import * as actions from '../../actions/home';

import {
  ReplyState,
  REPLY_TO_POST,
  SEND_REPLY_TO_SERVER,
  ReduxAction,
  SocketProps,
  Post,
  SUBMIT_POST,
  MAKE_POST
} from '../../constants';

import { dispatch } from '../../appStore';

afterEach(cleanup);

it('sends reply of a post to the sever', () => {
  const mockReplyProps: SocketProps = {
    text: expect.any(String),
    mentions: expect.any(Array),
    hashtags: expect.any(Array),
    pipe: 'POST_REPLY',
    post_id: expect.any(String)
  };

  const mockReplyState: ReplyState = {
    status: expect.any(String),
    err: expect.any(Boolean),
    data: expect.any(Object)
  };
  const replyToPostAction: ReduxAction = {
    type: REPLY_TO_POST,
    payload: {
      status: expect.any(String),
      err: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const sendReplyToServerAction: ReduxAction = {
    type: SEND_REPLY_TO_SERVER
  };

  const sendReplyToServerMockFunc = jest.fn((payload: SocketProps) => {
    return (dispatch: Function) => {
      actions.replyToPost(mockReplyState);
    };
  });

  sendReplyToServerMockFunc(mockReplyProps);
  expect(sendReplyToServerMockFunc).toHaveBeenCalledWith(mockReplyProps);
  expect(actions.replyToPost(mockReplyState)).toMatchObject(replyToPostAction);
  // expect(actions.sendReplyToServer(mockReplyProps)(dispatch)).toMatchObject(sendReplyToServerAction);
});

it('sends post to the sever', () => {
  const mockPostProps: Post = {
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

  const submitPostMockFunc = jest.fn((payload: Post, media: Array<string>) => {
    return (dispatch: Function) => {
      actions.createPost(mockPostState);
    };
  });

  submitPostMockFunc(mockPostProps, mockMedia);
  expect(submitPostMockFunc).toHaveBeenCalledWith(mockPostProps, mockMedia);
  // expect(actions.createPost(mockPostState)).toMatchObject(makePostAction);
  // expect(actions.submitPost(mockPostProps, mockMedia)(dispatch)).toMatchObject(submitPostAction);
});
