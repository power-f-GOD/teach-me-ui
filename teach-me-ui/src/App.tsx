import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import { Landing, _404, Main, Loader, SnackBar } from './components';
import ProtectedRoute from './ProtectedRoute';
import { dispatch } from './functions';
import { verifyAuth, displaySnackbar } from './actions';

const App = (props: any) => {
  const { status: authStatus, isAuthenticated } = props.auth;
  const { signin, signup, snackbar } = props;

  if (signin?.status !== 'pending' || signup?.status !== 'pending') {
    if (authStatus === 'pending') return <Loader />;
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
          <Route component={_404} />
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
      severity: 'success',
      autoHide: true
    })
  );
};

window.onoffline = () => {
  dispatch(
    displaySnackbar({
      open: true,
      message: 'You are offline.',
      severity: 'error'
    })
  );
};

const mapStateToProps = ({ auth, signin, signup, snackbar }: any) => {
  return { auth, signin, signup, snackbar };
};

export default connect(mapStateToProps)(App);
