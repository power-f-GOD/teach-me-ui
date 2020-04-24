import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import ArrowForward from '@material-ui/icons/ArrowForwardIosSharp';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';

import { handleSignoutRequest } from '../functions';
import { userDeviceIsMobile } from '../index';

const Nav = (props: any) => {
  const forMain = /main/i.test(props.for);

  return (
    <Box component='nav'>
      <ElevationScroll {...props} forMain={forMain} >
        <AppBar position='fixed'>
          <Container>
            <Toolbar className='nav-toolbar'>
              {userDeviceIsMobile ? (
                <IconButton
                  edge='start'
                  className=''
                  color='inherit'
                  aria-label='menu'>
                  <MenuIcon />
                </IconButton>
              ) : (
                ''
              )}
              <Link to='/'>
                <Box
                  component='h1'
                  marginLeft={userDeviceIsMobile ? '0.5em' : ''}
                  className='logo theme-color-primary-lightest'>
                  Teach Me!
                </Box>
              </Link>
              {forMain ? <MainNav {...props} /> : <IndexNav {...props} />}
            </Toolbar>
          </Container>
        </AppBar>
      </ElevationScroll>
    </Box>
  );
};

function IndexNav(props: any) {
  return (
    <Box className='nav-links-wrapper'>
      <Link to='/#!' className='nav-link'>
        Developers
      </Link>
      <Link to='/#!' className='nav-link'>
        Pricing
      </Link>
      <Link to='/about' className='nav-link'>
        About
      </Link>
      <Box component='span' marginX='2.5rem'></Box>
      <Link to='/#!' className='nav-link'>
        Support
      </Link>
      <Link to='/signin' className='nav-link'>
        <ArrowForward fontSize='inherit' /> Sign in
      </Link>
    </Box>
  );
}

function MainNav(props: any) {
  return (
    <Box className='nav-links-wrapper'>
      <Link to='/home' className='nav-link'>
        Home
      </Link>
      <Link to='/about' className='nav-link'>
        About
      </Link>
      <Link to='/#!' className='nav-link'>
        Profile
      </Link>
      <Box component='span' marginX='2.5rem'></Box>
      <Button
        variant='contained'
        className='nav-link'
        size='medium'
        id='signout-btn'
        color='secondary'
        fullWidth
        onClick={handleSignoutRequest}>
        Sign Out <ArrowForward fontSize='inherit' />
      </Button>
    </Box>
  );
}

function ElevationScroll(props: { children: React.ReactElement; forMain: boolean }) {
  const { children, forMain } = props;
  const trigger = useScrollTrigger({
    target: document.body,
    threshold: 50
  });

  return React.cloneElement(children, {
    elevation: trigger ? 8 : 0,
    className: trigger || forMain ? 'nav-background' : ''
  });
}

const mapStateToProps = ({ signout }: any) => {
  return { signout };
};

export default connect(mapStateToProps)(Nav);
