import { createStore, applyMiddleware, compose } from 'redux';

import thunk from 'redux-thunk';

import reducers from './reducers';

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = initStore();

export const dispatch = store.dispatch as Function;

export const getState = store.getState as Function;

function initStore() {
  const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));

  return store;
}

export default store;
