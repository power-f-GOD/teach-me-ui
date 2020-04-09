import { ReduxAction } from '../constants';
import store from './initStore';

export const { dispatch, getState } = store;

export function promisedDispatch(action: ReduxAction) {
  return new Promise((resolve: Function) => {
    resolve(dispatch(action));
  });
}
