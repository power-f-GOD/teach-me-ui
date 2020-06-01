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
import ChatBox from '../crumbs/ChatBox';
import _404 from '../Index/_404';

import createMemo from '../../Memo';

const Memoize = createMemo();

const Main = (props: any) => {
  const { signout } = props;

  if (signout.status === 'pending') {
    return <Loader />;
  }

  if (/signin|signup/.test(props.location.pathname)) {
    return <Redirect to='/' />;
  }

  return (
    <Grid className='main-root-grid fade-in'>
      <Memoize memoizedComponent={Nav} for='main' />

      <Switch>
        <Route path={['/', '/index', '/home']} exact component={Home} />
        <Route path='/about' component={About} />
        <Route path='/support' component={Support} />
        <Route path='/profile' component={Profile} />
        <Route component={_404} />
      </Switch>
      
      <Memoize memoizedComponent={ChatBox} />
    </Grid>
  );
};

const mapStateToProps = ({ signout }: any) => {
  return {
    signout
  };
};

export default connect(mapStateToProps)(Main);
