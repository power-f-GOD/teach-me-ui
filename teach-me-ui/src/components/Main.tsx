import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

import { Nav, Home, About, Footer, Loader } from './index';

const Main = (props: any) => {
  const { firstname, signout } = props;

  if (signout.status === 'pending') {
    return <Loader />;
  }

  return (
    <Grid className='main-root-grid fade-in'>
      <Nav for='main' />

      <Box padding='1rem'>
        <br />
        <br />
        <br />
        <Container>
          <Typography component='h1' variant='h5'>
            Welcome, {firstname.value}! This is the MAIN area!
          </Typography>
        </Container>

        <Switch>
          <Route path={['/', '/index', '/home']} exact component={Home} />
          <Route path='/about' component={About} />
        </Switch>
      </Box>

      <Footer />
    </Grid>
  );
};

const mapStateToProps = ({ displayName, firstname, signout }: any) => {
  return {
    displayName,
    firstname,
    signout
  };
};

export default connect(mapStateToProps)(Main);
