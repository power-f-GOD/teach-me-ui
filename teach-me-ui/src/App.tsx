import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import Index from './components/Index/Index';
import Auth from './components/Auth/Auth';
import Main from './components/Main/Main';
import Loader from './components/crumbs/Loader';
import SnackBar from './components/crumbs/SnackBar';
import ProtectedRoute from './ProtectedRoute';

import { verifyAuth } from './actions/auth';
import createMemo from './Memo';
import { dispatch } from './appStore';

import { emitUserOnlineStatus } from './functions/utils';

const Memo = createMemo();

const App = (props: any) => {
  const { signout, auth } = props;
  const { status: authStatus, isAuthenticated } = auth;

  if (authStatus === 'pending' || signout?.status === 'pending') {
    return <Loader />;
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
                    '/profile/:id',
                    '/@:userId',
                    '/@:userId/colleagues',
                    '/search',
                    '/p/:id',
                    '/questions',
                    '/question/:id',
                    '/*'
                  ]
                : ['/home', '/search']
            }
            exact
            component={Main}
            isAuthenticated={isAuthenticated}
          />
          <Route
            path={['/signin', '/signup', '/forgot-password', '/password/reset']}
            component={Auth}
          />
          {/* Is this still in use? Answer: Why not? Is it not obvious. Remove it and check it for yourself na. This is the route to the Index page. */}
          <Route
            path={[
              '/',
              '/index',
              '/about',
              '/profile/:id',
              '/@:userId',
              '/@:userId/colleagues',
              '/support',
              '/*'
            ]}
            exact
            component={Index}
          />
          {/* Is it? */}
        </Switch>
      </BrowserRouter>
      <Memo memoizedComponent={SnackBar} />
    </>
  );
};

//verify auth to keep user logged in assuming page is refreshed/reloaded
dispatch(verifyAuth()(dispatch));

window.ononline = () => {
  emitUserOnlineStatus(true, false, { open: true })();
};

window.onoffline = () => {
  emitUserOnlineStatus(false, true)();
};

const mapStateToProps = ({ auth, signout }: any) => {
  return { auth, signout };
};

export default connect(mapStateToProps)(App);
