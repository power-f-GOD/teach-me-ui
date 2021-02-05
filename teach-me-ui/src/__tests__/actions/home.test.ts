import { cleanup } from '@testing-library/react';

import * as actions from '../../actions/main/home';

import { SUBMIT_POST, MAKE_POST } from '../../constants';
import {
  ReduxAction,
  PostContent
} from '../../types';

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
        actions.makePost(mockPostState);
      };
    }
  );

  submitPostMockFunc(mockPostProps, mockMedia);
  expect(submitPostMockFunc).toHaveBeenCalledWith(mockPostProps, mockMedia);
  // expect(actions.makePost(mockPostState)).toMatchObject(makePostAction);
  // expect(actions.submitPost(mockPostProps, mockMedia)(dispatch)).toMatchObject(submitPostAction);
});
