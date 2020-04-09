import { createStore } from 'redux';
// import thunkMiddleware from 'redux-thunk';

// import { AppProps } from './constants/interfaces';

import reducers from '../reducers';

function initStore() {
  const store = createStore(reducers);

  return store;
}

const store = initStore();

export default store;

// export default function configureStore(persistedState: AppProps) {
//   const store = createStore(
//     reducer,
//     persistedState,
//     applyMiddleware(thunkMiddleware)
//   );

//   store.dispatch(verifyAuth()(store.dispatch));

//   return store;
// }
