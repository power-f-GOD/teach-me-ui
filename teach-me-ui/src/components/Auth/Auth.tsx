import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import Box from '@material-ui/core/Box';

import {
  Signin,
  Signup,
  Footer,
  ForgotPassword,
  ResetPassword
} from '../index';

const Auth = (props: any) => {
  const isSignup = /\/signup/.test(props.location.pathname);

  React.useEffect(() => () => window.scrollTo(0, 0), []);

  return (
    <Container fluid className='Auth auth-root-grid custom-scroll-bar fade-in p-0'>
      <Box className='auth-main-box' component='main'>
        <Container className='auth-container p-0 d-flex justify-content-center align-content-center'>
          <Row className='custom-scroll-bar justify-content-center flex-column align-items-center fade-in mx-0'>
            <Box maxWidth='100%'>
              <Box
                width='auto'
                component='section'
                className='form-section custom-scroll-bar'>
                <Box marginY='1.5em' textAlign='center' width='100%'>
                  <h4 className='text-center'>
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
                  </h4>
                </Box>

                <Switch>
                  <Route path='/signin' component={Signin} />
                  <Route path='/signup' component={Signup} />
                  <Route path='/forgot-password' component={ForgotPassword} />
                  <Route
                    exact
                    path='/password/reset'
                    component={ResetPassword}
                  />
                </Switch>
              </Box>
            </Box>
          </Row>
        </Container>
      </Box>

      <Footer />
    </Container>
  );
};

export default Auth;
