import { ReduxAction } from '../constants';
<<<<<<< HEAD
import store from '../appStore';
=======
import store from './initStore';
>>>>>>> Modify code base for signup validation et al.

export const { dispatch, getState } = store;

export function promisedDispatch(action: ReduxAction) {
  return new Promise((resolve: Function) => {
    resolve(dispatch(action));
  });
}
