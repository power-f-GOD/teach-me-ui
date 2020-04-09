import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import { Landing, Main, PageNotFound } from './components';
<<<<<<< HEAD
import store from './appStore';

const store = initStore();

export const dispatch = store.dispatch;

const store = initStore();

export const dispatch = store.dispatch;
=======
import store from './functions/initStore';
>>>>>>> Modify code base for signup validation et al.

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route path={['/', '/home', '/about']} exact component={Main} />
          <Route path={['/signin', '/signup']} component={Landing} />
          <Route component={PageNotFound} />
        </Switch>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
