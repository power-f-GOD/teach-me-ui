import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import { Nav, Home, About } from '../components';
import { connect } from 'react-redux';
import Box from '@material-ui/core/Box';

const Main = (props: any) => {
  const { firstname } = props;

  return (
    <Grid className='main-root-grid fade-in'>
      <Nav />
      <Box padding='1rem'>
        <Container component='div'>
          <Typography component='h1' variant='h5'>
            Welcome, {firstname.value}! This is the MAIN area!
          </Typography>
          <Switch>
            <Route path={['/', '/home']} exact component={Home} />
            <Route path='/about' component={About} />
          </Switch>
        </Container>
      </Box>
    </Grid>
  );
};

const mapStateToProps = (state: any) => {
  return { displayName: state.displayName, firstname: state.firstname };
};

export default connect(mapStateToProps)(Main);
