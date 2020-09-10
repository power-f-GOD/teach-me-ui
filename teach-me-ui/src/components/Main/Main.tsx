import React, { useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';

import Nav from '../crumbs/Nav';
import Home from './Home';
import About from '../Index/About';
import Support from '../Index/Support';
import Profile from './Profile';
import Loader from '../crumbs/Loader';
import ModalFrame from '../crumbs/modals';
import Chat from './Chat';
import Search from './Search';
import Notifications from './Notifications';
import PostPage from './PostPage';
import _404 from '../Index/_404';

import createMemo from '../../Memo';
import {
  dispatch,
  getState,
  emitUserOnlineStatus
} from '../../functions/utils';
import { initWebSocket, closeWebSocket } from '../../actions/misc';

import activateSocketRouters from '../../socket.router';

import { getConversations } from '../../actions/chat';
import { SearchState } from '../../constants';

const Memoize = createMemo();

const Main = (props: any) => {
  const {
    signoutStatus,
    userToken,
    webSocket: socket,
    convosLength,
    convosErr,
    convosStatus
  } = props;

  useEffect(() => {
    if (!convosLength && !convosErr && convosStatus !== 'fulfilled') {
      dispatch(getConversations()(dispatch));
    }
  }, [convosLength, convosErr, convosStatus]);

  useEffect(() => {
    dispatch(initWebSocket(userToken as string));
    activateSocketRouters();

    return () => {
      dispatch(closeWebSocket());
    };
  }, [userToken]);

  useEffect(() => {
    if (socket) {
      socket.addEventListener('open', () => {
        console.log('Sockets shook hands! :)');
        emitUserOnlineStatus()();
      });

      socket.addEventListener('error', () => {
        console.error(
          'Error: Sockets lost hands while trying to make handshake. :('
        );
      });

      socket.addEventListener('close', () => {
        console.log('Sockets called it a day! :|');
      });
    }
  }, [socket]);

  if (signoutStatus === 'pending') {
    return <Loader />;
  }

  if (/signin|signup/.test(props.location.pathname)) {
    //redirect to actual URL user was initially trying to access when wasn't authenticated
    return <Redirect to={props.location.state?.from || { pathname: '/' }} />;
  }

  return (
    <>
      <ModalFrame />
      <Grid className='Main fade-in'>
        <Memoize
          memoizedComponent={Nav}
          for='main'
          isAuthenticated={!!userToken}
        />
        <Switch>
          <Route path={['/', '/index', '/home']} exact component={Home} />
          <Route path='/about' component={About} />
          <Route path='/support' component={Support} />
          <Route path='/p/:id' component={PostPage} />
          <Route path='/@:userId' component={Profile} />
          <Route path={['/search/:query', '/search']} component={Search} />
          <Route path='/notifications' component={Notifications} />
          <Route component={_404} />
        </Switch>
        <Memoize memoizedComponent={Chat} location={props.location} />
      </Grid>
    </>
  );
};

document.addEventListener('visibilitychange', () => {
  emitUserOnlineStatus(
    window.navigator.onLine &&
      (getState().webSocket ?? ({} as WebSocket)).readyState !== 1,
    false
  )();
});

const mapStateToProps = (state: any) => {
  const convos = state.conversations as SearchState;

  return {
    signoutStatus: state.signout.status,
    userToken: state.userData.token,
    webSocket: state.webSocket,
    convosLength: convos.data?.length,
    convosStatus: convos.status,
    convosErr: convos.err
  };
};

export default connect(mapStateToProps)(Main);
