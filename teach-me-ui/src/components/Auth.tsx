import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import { Signin, Signup } from './index';

const Auth = (props: any) => {
  const isSignup = /\/signup/.test(props.location.pathname);

  return (
    <Box className='auth-main-box custom-scroll-bar fade-in' component='main'>
      <Container className='auth-container'>
        <Grid
          className='custom-scroll-bar fade-in'
          container
          justify='center'
          direction='row'
          alignItems='center'>
          <Box maxWidth={isSignup ? '820px' : 'xs'}>
            <Grid
              component='section'
              className='form-section custom-scroll-bar'
              container
              item
              alignItems='center'>
              <Box marginY='1em' textAlign='center' width='100%'>
                <Typography component='h1' variant='h4' align='center'>
                  <Link to='/'>
                    <Box component='span' className='logo theme-color-primary'>
                      Teach Me!
                    </Box>
                  </Link>
                  {isSignup ? (
                    <Box component='span' fontSize='1.5rem' fontWeight={900}>
                      {' '}
                      - Sign up
                    </Box>
                  ) : (
                    ''
                  )}
                </Typography>
              </Box>

              <Switch>
                <Route path='/signin' component={Signin} />
                <Route path='/signup' component={Signup} />
              </Switch>
            </Grid>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

export default Auth;
