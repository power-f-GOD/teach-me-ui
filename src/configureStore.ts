import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { verifyAuth, AppProps } from './actions';
import rootReducer from './reducers';

export default function configureStore(persistedState: AppProps) {
  const store = createStore(
    rootReducer,
    persistedState,
    applyMiddleware(thunkMiddleware)
  );

  store.dispatch(verifyAuth()(store.dispatch));

  return store;
}
