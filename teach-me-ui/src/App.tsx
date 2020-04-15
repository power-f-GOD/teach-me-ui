import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import { Landing, PageNotFound, Main, Loader, SnackBar } from './components';
import ProtectedRoute from './ProtectedRoute';
import { dispatch } from './functions';
import { verifyAuth, displaySnackbar, online } from './actions';

const App = (props: any) => {
  const { status, isAuthenticated } = props.auth;
  const { signin, signup, snackbar } = props;

  if (signin?.status !== 'pending' || signup?.status !== 'pending') {
    if (status === 'pending') return <Loader />;
  }

  return (
    <>
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
      <SnackBar snackbar={snackbar} />
    </>
  );
};

//verify auth to keep user logged in assuming page is refreshed/reloaded
dispatch(verifyAuth()(dispatch));

window.ononline = () => {
  dispatch(
    displaySnackbar({
      open: true,
      message: 'You are back online.',
      severity: 'success'
    })
  );
  dispatch(online(true));
};

window.onoffline = () => {
  dispatch(
    displaySnackbar({
      open: true,
      message: 'You are offline.',
      severity: 'error'
    })
  );
  dispatch(online(false));
};

const mapStateToProps = (state: any) => {
  return {
    auth: state.auth,
    signin: state.signin,
    signup: state.signup,
    snackbar: state.snackbar
  };
};

export default connect(mapStateToProps)(App);
