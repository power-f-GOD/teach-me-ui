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

      <Box className='index-root-box'>
        {/* <Container className='index-container'>
          <Grid
            className='custom-scroll-bar fade-in'
            container
            justify='center'
            direction='column'
            alignItems='center'> */}
            <Switch>
              <Route path={['/', '/index']} exact component={Landing} />
              <Route path='/about' component={About} />
            </Switch>
          {/* </Grid>
        </Container> */}
      </Box>
    </Grid>
  );
};

export default Index;
