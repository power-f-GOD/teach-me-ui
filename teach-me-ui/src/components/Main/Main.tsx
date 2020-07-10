import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';

import Nav from '../crumbs/Nav';
import Home from './Home';
import About from '../Index/About';
import Support from '../Index/Support';
import Profile from './Profile';
import Loader from '../crumbs/Loader';
import Chat from '../crumbs/Chat';
import _404 from '../Index/_404';
import Search from './Search';

import createMemo from '../../Memo';
import { dispatch } from '../../functions/utils';
import { initWebSocket, closeWebSocket } from '../../actions/misc';
// import { ChatState } from '../../constants';

const Memoize = createMemo();

const Main = (props: any) => {
  const { signout, userData } = props;
  // const {
  //   queryString: qString,
  //   isOpen: chatIsOpen
  // }: ChatState = chatState;
  // let queryString = qString!.split('?')[1] ?? '';
  // queryString = chatIsOpen ? `?${queryString}` : '';
  React.useEffect(() => {
    dispatch(initWebSocket(userData.token as string));

    return () => {
        dispatch(closeWebSocket());
    };
  }, [userData.token]);

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
        <Route path='/@*' component={Profile} />
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
    userData: state.userData
  };
};

export default connect(mapStateToProps)(Main);
