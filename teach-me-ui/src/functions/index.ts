import { ReduxAction } from '../constants';
import { dispatch } from '../App';

export * from './signup';

export function promisedDispatch(action: ReduxAction) {
  return new Promise((resolve: Function) => {
    resolve(dispatch(action));
  });
}
