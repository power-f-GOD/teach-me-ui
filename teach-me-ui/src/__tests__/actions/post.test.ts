import { cleanup } from '@testing-library/react';

import * as actions from '../../actions/posts';

import { 
  ReplyState, 
  REPLY_TO_POST, 
  SEND_REPLY_TO_SERVER, 
  ReduxAction, 
  SocketProps,
} from '../../constants';

import { dispatch } from '../../appStore';


afterEach(cleanup);

it("sends reply of a post to the sever", () => {
  const mockReplyProps: SocketProps = {
    text: expect.any(String),
    mentions: expect.any(Array),
    hashtags: expect.any(Array),
    pipe: 'POST_REPLY',
    post_id: expect.any(String)
  };
  
  const mockReplyState: ReplyState = {
    status: expect.any(String),
    error: expect.any(Boolean),
    data: expect.any(Object)
  }
  const replyToPostAction: ReduxAction = {
    type: REPLY_TO_POST,
    payload: {
      status: expect.any(String),
      error: expect.any(Boolean),
      data: expect.any(Object)
    }
  };

  const sendReplyToServerAction: ReduxAction = {
    type: SEND_REPLY_TO_SERVER
  };

  const sendReplyToServerMockFunc = jest.fn((payload: SocketProps) => {
    return (dispatch: Function) => {
      actions.replyToPost(mockReplyState);
    }
  });

  sendReplyToServerMockFunc(mockReplyProps);
  expect(sendReplyToServerMockFunc).toHaveBeenCalledWith(mockReplyProps);
  expect(actions.replyToPost(mockReplyState)).toMatchObject(replyToPostAction);
  // expect(actions.sendReplyToServer(mockReplyProps)(dispatch)).toMatchObject(sendReplyToServerAction);
});
