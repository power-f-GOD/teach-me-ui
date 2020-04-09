import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import { Landing, Main, PageNotFound } from './components';
import store from './appStore';

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
