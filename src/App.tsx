import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import Login from './components/Login';
import { AppProps } from './actions';

const App: FC = (props: AppProps) => {
  const { isAuthenticated, isVerifying } = props;

  return (
    <Switch>
      <ProtectedRoute
        exact
        path='/'
        component={Home}
        isAuthenticated={isAuthenticated}
        isVerifying={isVerifying}
      />
      <Route path='/login' component={Login} />
    </Switch>
  );
};

const mapStateToProps = (state: AppProps) => {
  return {
    isAuthenticated: state.auth!.isAuthenticated,
    isVerifying: state.auth!.isVerifying
  };
};

export default connect(mapStateToProps)(App);
