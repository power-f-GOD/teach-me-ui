import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import { Landing, PageNotFound, Main, Loader } from './components';
import ProtectedRoute from './ProtectedRoute';

const App = (props: any) => {
  const { status, isAuthenticated } = props.auth;
  const { signin, signup } = props;

  if (signin?.status !== 'pending' || signup?.status !== 'pending') {
    if (status === 'pending') return <Loader />;
  }

  return (
    <BrowserRouter>
      <Switch>
        <ProtectedRoute
          path={['/', '/home', '/about']}
          exact
          component={Main}
          isAuthenticated={isAuthenticated}
        />
        <Route path={['/signin', '/signup']} component={Landing} />
        <Route component={PageNotFound} />
      </Switch>
    </BrowserRouter>
  );
};

const mapStateToProps = (state: any) => {
  return {
    auth: state.auth
  };
};

export default connect(mapStateToProps)(App);
