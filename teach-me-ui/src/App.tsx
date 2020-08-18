import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import queryString from 'query-string';

import Index from './components/Index/Index';
import Auth from './components/Auth/Auth';
import Main from './components/Main/Main';
import Loader from './components/crumbs/Loader';
import SnackBar from './components/crumbs/SnackBar';
import ProtectedRoute from './ProtectedRoute';

import { displaySnackbar, initWebSocket } from './actions/misc';
import { verifyAuth } from './actions/auth';
import createMemo from './Memo';
import { getState, dispatch } from './appStore';
import {
  UserData,
  ChatState,
  AuthState,
  ConversationInfo,
  ConversationMessages
} from './constants/interfaces';
import activateSocketRouters from './socket.router';
import {
  getConversations,
  getConversationInfo,
  getConversationMessages
} from './actions/chat';

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
                    '/@:userId',
                    '/@:userId/colleagues',
                    '/search',
                    '/notifications',
                    '/*'
                  ]
                : ['/home', '/search', '/notifications']
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

  const socket = getState().webSocket as WebSocket;
  const userData = getState().userData as UserData;
  const auth = getState().auth as AuthState;
  const chatState = getState().chatState as ChatState;
  const conversations = getState().conversations.data as ConversationInfo[];
  const conversationMessages = getState().conversationMessages
    .data as ConversationMessages['data'];
  const { id, cid } = queryString.parse(window.location.search) ?? {};

  if (auth.isAuthenticated) {
    if (userData?.token && socket && socket.readyState !== 1) {
      dispatch(initWebSocket(userData.token as string));
      activateSocketRouters();
    }

    if (chatState.isOpen) {
      if (conversations?.length === 0) {
        dispatch(getConversations()(dispatch));
      }

      if (id && conversationMessages?.length === 0) {
        dispatch(getConversationInfo(id)(dispatch));
        dispatch(getConversationMessages(cid)(dispatch));
      }
    }
  }
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
