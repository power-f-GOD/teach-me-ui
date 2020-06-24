import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import { Signin, Signup, Footer } from '../index';

const Auth = (props: any) => {
  const isSignup = /\/signup/.test(props.location.pathname);

  React.useEffect(() => () => window.scrollTo(0, 0), []);

  return (
    <Grid
      container
      className='Auth auth-root-grid custom-scroll-bar fade-in'
      direction='column'>
      <Box className='auth-main-box' component='main'>
        <Container className='auth-container'>
          <Grid
            className='custom-scroll-bar fade-in'
            container
            justify='center'
            direction='row'
            alignItems='center'>
            <Box maxWidth='100%'>
              <Box
                width='auto'
                component='section'
                className='form-section custom-scroll-bar'>
                <Box marginY='1.5em' textAlign='center' width='100%'>
                  <Typography component='div' variant='h4' align='center'>
                    <Link to='/'>
                      <Box component='h3' className='logo gradient'>
                        Kanyimuta!
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
              </Box>
            </Box>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Grid>
  );
};

export default Auth;
