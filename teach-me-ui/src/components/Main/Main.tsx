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
import Chat from './Chat';
import Search from './Search';
import Notifications from './Notifications';
import _404 from '../Index/_404';

import createMemo from '../../Memo';
import { dispatch, getState } from '../../functions/utils';
import { initWebSocket, closeWebSocket } from '../../actions/misc';

import activateSocketRouters from '../../socket.router';
import { emitUserOnlineStatus } from '../../App';

const Memoize = createMemo();

const Main = (props: any) => {
  const { signout, userData, webSocket: socket } = props;

  useEffect(() => {
    dispatch(initWebSocket(userData.token as string));
    activateSocketRouters();

    return () => {
      dispatch(closeWebSocket());
    };
  }, [userData.token]);

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

  if (!/chat=/.test(window.location.search)) {
    window.history.replaceState({}, '', window.location.pathname);
  }

  if (signout.status === 'pending') {
    return <Loader />;
  }

  if (/signin|signup/.test(props.location.pathname)) {
    //redirect to actual URL user was initially trying to access when wasn't authenticated
    return <Redirect to={props.location.state?.from || { pathname: '/' }} />;
  }

  return (
    <Grid className='Main fade-in'>
      <Memoize memoizedComponent={Nav} for='main' />

      <Switch>
        <Route path={['/', '/index', '/home']} exact component={Home} />
        <Route path='/about' component={About} />
        <Route path='/support' component={Support} />
        <Route path='/@:userId' component={Profile} />
        <Route path={['/search/:query', '/search']} component={Search} />
        <Route path='/notifications' component={Notifications} />
        <Route component={_404} />
      </Switch>

      <Memoize memoizedComponent={Chat} />
    </Grid>
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
  return {
    signout: state.signout,
    userData: state.userData,
    webSocket: state.webSocket
  };
};

export default connect(mapStateToProps)(Main);
