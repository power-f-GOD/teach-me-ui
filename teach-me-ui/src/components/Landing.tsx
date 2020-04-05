import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
// import { Grid, Container, Typography, Box } from '@material-ui/core';

import { Signin, Signup } from '../components';
import { useLandingStyles } from '../styles';

const Landing = () => {
  const classes = useLandingStyles();

  return (
    <Grid className={classes.landingRootGrid}>
      <Container className={classes.landingRootContainer} maxWidth='lg'>
        <Grid
          className={`${classes.landingMainGrid} custom-scroll-bar fade-in`}
          component='main'
          container
          justify='center'
          direction='row'
          alignItems='flex-start'>
          <Grid
            component='section'
            className={`${classes.splashSection} custom-scroll-bar`}
            container
            item
            justify='flex-end'
            md={7}>
            <Container maxWidth='sm'>
              <Grid
                className={classes.splash}
                container
                justify='flex-end'
                alignItems='center'
                direction='column'>
                <Box marginBottom='2em'>
                  <Typography component='h3' variant='h6' align='center'>
                    Welcome to{' '}
                    <span className='logo theme-color-blue-light'>
                      Teach Me!
                    </span>
                  </Typography>
                </Box>
              </Grid>
            </Container>
          </Grid>

          <Grid
            component='section'
            className={`${classes.formSection} custom-scroll-bar`}
            container
            item
            alignItems='center'
            md={5}>
            <Container maxWidth='sm'>
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
