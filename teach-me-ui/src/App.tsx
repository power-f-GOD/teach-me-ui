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

import { displaySnackbar, initWebSocket, setUserData } from './actions/misc';
import { verifyAuth } from './actions/auth';
import createMemo from './Memo';
import { getState, dispatch } from './appStore';
import {
  UserData,
  ChatState,
  AuthState,
  ConversationMessages,
  SearchState,
  APIConversationResponse
} from './constants/interfaces';
import activateSocketRouters from './socket.router';
import {
  getConversations,
  getConversationMessages,
  conversations,
  conversationInfo
} from './actions/chat';
import { ONLINE_STATUS } from './constants/misc';

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
                    '/p/:id',
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

export const emitUserOnlineStatus = (
  shouldReInitWebSocket?: boolean,
  connectionIsDead?: boolean,
  snackBarOptions?: {
    open?: boolean;
    severity?: 'error' | 'success' | 'info';
    message?: string;
  }
) => {
  const { open, severity, message } = snackBarOptions ?? {};

  if (connectionIsDead) {
    dispatch(
      displaySnackbar({
        open: true,
        autoHide: !connectionIsDead,
        message: message ? message : 'You are offline.',
        severity: severity ? severity : 'error'
      })
    );
  } else if (open) {
    dispatch(
      displaySnackbar({
        open: true,
        autoHide: true,
        message: message ? message : 'You are back online.',
        severity: severity ? severity : 'success'
      })
    );
  }

  const socket = getState().webSocket as WebSocket;
  const userData = getState().userData as UserData;
  const auth = getState().auth as AuthState;
  const chatState = getState().chatState as ChatState;
  const _conversations = getState().conversations as SearchState;
  const conversationMessages = getState().conversationMessages
    .data as ConversationMessages['data'];
  const { cid } = queryString.parse(window.location.search) ?? {};
  let timeToEmitOnlineStatus: any = undefined;

  if (auth.isAuthenticated && !connectionIsDead) {
    if (shouldReInitWebSocket) {
      dispatch(initWebSocket(userData.token as string));
      activateSocketRouters();
    }

    if (chatState.isOpen) {
      if (_conversations?.data?.length === 0) {
        dispatch(getConversations()(dispatch));
      }

      if (conversationMessages?.length === 0)
        dispatch(getConversationMessages(cid)(dispatch));
    }

    return function recurse() {
      timeToEmitOnlineStatus = setTimeout(() => {
        if (
          socket.readyState === 1 &&
          /ONLINE|AWAY/.test(getState().conversationInfo?.online_status)
        ) {
          const docIsVisible = document.visibilityState === 'visible';

          socket.send(
            JSON.stringify({
              online_status: docIsVisible ? 'ONLINE' : 'AWAY',
              pipe: ONLINE_STATUS
            })
          );
          dispatch(
            setUserData({
              online_status: docIsVisible ? 'ONLINE' : 'AWAY'
            })
          );
          clearTimeout(timeToEmitOnlineStatus);
        } else {
          recurse();
        }
      }, 500);
    };
  }

  return () => {
    if (auth.isAuthenticated) {
      const updateConversations = _conversations.data?.map(
        (conversation): APIConversationResponse => {
          return { ...conversation, online_status: 'OFFLINE' };
        }
      ) as SearchState['data'];

      dispatch(conversations({ data: [...updateConversations] }));
      dispatch(
        conversationInfo({
          online_status: 'OFFLINE',
          status: 'settled',
          data: { ...getState().conversationInfo.data, last_seen: undefined }
        })
      );
    }
  };
};

window.ononline = () => {
  emitUserOnlineStatus(true, false, { open: true })();
};

window.onoffline = () => {
  emitUserOnlineStatus(false, true)();
};

const mapStateToProps = ({ auth, signin, signup, snackbar }: any) => {
  return { auth, signin, signup, snackbar };
};

export default connect(mapStateToProps)(App);
