import React from 'react';
import { Switch, Route } from 'react-router-dom';
// import { connect } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
// import { Grid, Container, Typography, Box } from '@material-ui/core';

import { Signin, Signup } from '../components';

const Landing = () => {
  return (
    <Grid className='landing-root-grid'>
      <Container className='landing-root-container'>
        <Grid
          className='landing-main-grid custom-scroll-bar fade-in'
          component='main'
          container
          justify='center'
          direction='row'
          alignItems='flex-start'>
          <Grid
            component='section'
            className='splash-section custom-scroll-bar'
            container
            item
            justify='flex-end'
            md={7}>
            <Container maxWidth='sm'>
              <Grid
                className='splash'
                container
                justify='flex-end'
                alignItems='center'
                direction='column'>
                <Typography component='h3' variant='h6' align='center'>
                  <Box marginBottom='2em' fontSize='1.65vw'>
                    Welcome to{' '}
                    <span className='logo theme-color-blue-light-1'>
                      Teach Me!
                    </span>
                  </Box>
                </Typography>
              </Grid>
            </Container>
          </Grid>

          <Grid
            component='section'
            className='form-section custom-scroll-bar'
            container
            item
            alignItems='center'
            md={5}>
            <Container maxWidth='xs'>
              <Box marginBottom='1.25em'>
                <Typography
                  className='logo theme-color-blue-dark'
                  component='h1'
                  variant='h4'
                  align='center'>
                  Teach Me!
                </Typography>
              </Box>

              <Switch>
                <Route path='/signin' component={Signin} />
                <Route path='/signup' component={Signup} />
              </Switch>
            </Container>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  );
};

export default Landing;
