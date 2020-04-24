import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

import Nav from './Nav';
import About from './About';
import Landing from './Landing';

const Index = () => {
  return (
    <Grid className='index-root-grid custom-scroll-bar fade-in'>
      <Nav for='index' />

      <Box className='index-main-box' component='main'>
        <Container className='index-container'>
          <Grid
            className='custom-scroll-bar fade-in'
            container
            justify='center'
            direction='column'
            alignItems='center'>
            <br />
            <br />
            <br />
            <Box>This is the Index Page!</Box>
            <br />
            Scroll to bottom and see nav bar change background!
            <Switch>
              <Route path={['/', '/index']} exact component={Landing} />
              <Route path='/about' component={About} />
            </Switch>
          </Grid>
        </Container>
      </Box>
    </Grid>
  );
};

export default Index;
