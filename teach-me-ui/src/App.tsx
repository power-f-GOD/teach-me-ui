import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import { Index, Auth, Main, Loader, SnackBar, Gallery } from './components';
import ProtectedRoute from './ProtectedRoute';

import { verifyAuth } from './actions';
import createMemo from './Memo';
import { dispatch } from './appStore';

import { emitUserOnlineStatus } from './utils';
import { AuthState, FetchState } from './types';
import { setWindowWidth } from './actions';

const Memo = createMemo();

const App = (props: any) => {
  const { signout, auth } = props;
  const { status: authStatus, isAuthenticated } = auth;

  React.useEffect(() => {
    //verify auth to keep user logged in assuming page is refreshed/reloaded
    dispatch(verifyAuth());

    window.onresize = () => {
      // Attepmt to fix test-build error/failure
      if (setWindowWidth) {
        dispatch(setWindowWidth(window.innerWidth));
      }

      if (window.innerWidth > 767) {
        document.body.dataset.hideNav = '' + false;
      }
    };
    window.onresize(window as any);
  }, []);

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
                    '/@:username',
                    '/@:username/colleagues',
                    '/search',
                    '/p/:id',
                    '/questions',
                    '/question/:id',
                    '/chat/:convoId',
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
              '/@:username',
              '/@:username/colleagues',
              '/p/:id',
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
      <Gallery />
    </>
  );
};

window.ononline = () => {
  emitUserOnlineStatus(true, false, { open: true })();
};

window.onoffline = () => {
  emitUserOnlineStatus(false, true)();
};

const mapStateToProps = ({
  auth,
  signout
}: {
  auth: AuthState;
  signout: FetchState<any>;
}) => {
  return { auth, signout };
};

export default connect(mapStateToProps)(App);
