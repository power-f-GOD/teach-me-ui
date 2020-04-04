import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import { Landing, Main, PageNotFound } from './components';


const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path={['/', '/home', '/about']} exact component={Main} />
        <Route path={['/signin', '/signup']} component={Landing} />
        <Route component={PageNotFound} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
