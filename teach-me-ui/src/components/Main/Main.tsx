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
import _404 from '../Index/_404';
import Search from './Search';

import createMemo from '../../Memo';
import { dispatch } from '../../functions/utils';
import { initWebSocket, closeWebSocket } from '../../actions/misc';
// import { ChatState } from '../../constants';

const Memoize = createMemo();

const Main = (props: any) => {
  const { signout, userData, webSocket: socket } = props;

  useEffect(() => {
    dispatch(initWebSocket(userData.token as string));

    return () => {
      dispatch(closeWebSocket());
    };
  }, [userData.token]);

  useEffect(() => {
    if (socket) {
      socket.addEventListener('open', () => {
        console.log('Socket connected!');
      });

      socket.addEventListener('error', (e: any) => {
        console.error('An error occurred while trying to connect Web Socket.');
      });

      socket.addEventListener('close', () => {
        console.log('Socket closed!');
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
    <Grid className='main-root-grid fade-in'>
      <Memoize memoizedComponent={Nav} for='main' />

      <Switch>
        <Route path={['/', '/index', '/home']} exact component={Home} />
        <Route path='/about' component={About} />
        <Route path='/support' component={Support} />
        <Route path='/@:userId' component={Profile} />
        <Route path='/search' component={Search} />
        <Route component={_404} />
      </Switch>

      <Memoize memoizedComponent={Chat} />
    </Grid>
  );
};

const mapStateToProps = (state: any) => {
  return {
    signout: state.signout,
    userData: state.userData,
    webSocket: state.webSocket
  };
};

export default connect(mapStateToProps)(Main);
