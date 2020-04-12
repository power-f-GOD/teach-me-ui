import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import reducers from './reducers';

const store = initStore();

function initStore() {
  const store = createStore(reducers, applyMiddleware(thunk));

  return store;
}

export default store;
