import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import Index from './components/Index/Index';
import Auth from './components/Auth/Auth';
import Main from './components/Main/Main';
import Loader from './components/crumbs/Loader';
import SnackBar from './components/crumbs/SnackBar';
import ProtectedRoute from './ProtectedRoute';

import { dispatch } from './functions/utils';
import { displaySnackbar } from './actions/misc';
import { verifyAuth } from './actions/auth';
import createMemo from './Memo';

const Memo = createMemo();

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
            path={
              isAuthenticated
                ? [
                    '/',
                    '/index',
                    '/home',
                    '/about',
                    '/support',
                    '/@*',
                    '/search',
                    '/*'
                  ]
                : ['/home', '/search']
            }
            exact
            component={Main}
            isAuthenticated={isAuthenticated}
          />
          <Route
            path={[
              '/signin',
              '/signup',
              '/forgot-password',
              '/password/reset/:token'
            ]}
            component={Auth}
          />
          <Route
            path={['/', '/index', '/about', '/@*', '/support', '/*']}
            exact
            component={Index}
          />
        </Switch>
      </BrowserRouter>
      <Memo memoizedComponent={SnackBar} snackbar={snackbar} />
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
