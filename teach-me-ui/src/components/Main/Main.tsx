import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';

import { Nav, Home, About, Support, Profile, Loader, ChatBox } from '../index';

const Main = (props: any) => {
  const { signout } = props;

  if (signout.status === 'pending') {
    return <Loader />;
  }

  return (
    <Grid className='main-root-grid fade-in'>
      <Nav for='main' />
      <Switch>
        <Route path={['/', '/index', '/home']} exact component={Home} />
        <Route path='/about' component={About} />
        <Route path='/support' component={Support} />
        <Route path='/profile' component={Profile} />
      </Switch>
      <ChatBox />
    </Grid>
  );
};

const mapStateToProps = ({ signout }: any) => {
  return {
    signout
  };
};

export default connect(mapStateToProps)(Main);
