import { dispatch, promisedDispatch } from '../utils';
import { requestSignout, closeWebSocket } from '../actions';

export function handleSignoutRequest() {
  promisedDispatch(closeWebSocket()).then(() => {
    dispatch(requestSignout()(dispatch));
  });
}
