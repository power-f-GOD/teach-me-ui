import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import { Landing, Main, PageNotFound } from './components';
import initStore from './initStore';
// import { appState } from './constants';

const App = () => {
  return (
    <Provider store={initStore()}>
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
