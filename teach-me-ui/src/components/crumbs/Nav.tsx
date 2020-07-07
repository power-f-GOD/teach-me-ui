import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import ArrowForward from '@material-ui/icons/ArrowForwardIosSharp';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/MenuRounded';
import HomeIcon from '@material-ui/icons/HomeRounded';
import InfoIcon from '@material-ui/icons/InfoRounded';
import HelpIcon from '@material-ui/icons/HelpRounded';
import AccountIcon from '@material-ui/icons/AccountBoxRounded';
import SearchIcon from '@material-ui/icons/Search';
import Tooltip from "@material-ui/core/Tooltip";
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Dropdown from 'react-bootstrap/Dropdown';

import Notifications from '../Main/Notifications';

import { handleSignoutRequest } from '../../functions';

const Nav = (props: any) => {
  const forIndexPage = /index/i.test(props.for);
  const forLandingPage =
    forIndexPage && /\/index|\/$|\/[^a-z]+$/i.test(window.location.href);

  return (
    <Box component='nav'>
      <ElevationScroll {...props} forLandingPage={forLandingPage && !/404/.test(window.location.pathname)}>
        <AppBar position='fixed' className='mobile-width'>
          <Container>
            <Toolbar className='nav-toolbar'>
              <Link to='/'>
                <Box component='h3' className='logo gradient'>
                  Kanyimuta!
                </Box>
              </Link>

              {forIndexPage ? (
                <IndexNav {...props} className='app-bar-links' />
              ) : (
                <MainNav {...props} className='app-bar-links' />
              )}

              <TemporaryDrawer>
                {forIndexPage ? (
                  <IndexNav {...props} />
                ) : (
                  <MainNavMenu {...props} />
                )}
              </TemporaryDrawer>
            </Toolbar>
          </Container>
        </AppBar>
      </ElevationScroll>
    </Box>
  );
};

function IndexNav(props: any) {
  return (
    <Box className={`nav-links-wrapper ${props?.className}`}>
      <NavLink to='/search' className='nav-link'>
        <SearchIcon />
      </NavLink>
      <NavGeneralLinks forIndex />
      <NavLink to='/signin' className='nav-link'>
        <ArrowForward fontSize='inherit' /> Sign in
      </NavLink>
    </Box>
  );
}

function MainNav(props: any) {
  return (
    <Box className={`nav-links-wrapper ${props?.className}`}>
     
      <NavLink to='/search' className='nav-link'>
        <SearchIcon />
      </NavLink>
      <NavGeneralLinks />
      <NavLink exact to='/@' className='nav-link'>
        <AccountIcon className='nav-icon' /> Profile
      </NavLink>
      <Dropdown className='dropdownN'>
        <Dropdown.Toggle  id="dropdown" as='p'>
        <Tooltip
          title="Notifications"
          placement="bottom"
        >
          <Badge badgeContent={4} color='secondary'>
            <NotificationsIcon />
          </Badge>
        </Tooltip>
        </Dropdown.Toggle>
        <Dropdown.Menu className='dropdown-contents'>
          <Notifications />
        </Dropdown.Menu>
      </Dropdown>
      <Button
        variant='contained'
        className='nav-link'
        size='medium'
        id='signout-btn'
        fullWidth
        onClick={handleSignoutRequest}>
        Sign Out <ArrowForward fontSize='inherit' />
      </Button>
    </Box>
  );
};


function MainNavMenu(props: any) {
  return (
    <Box className={`nav-links-wrapper ${props?.className}`}>
     
      <NavLink to='/search' className='nav-link'>
        <SearchIcon />
      </NavLink>
      <NavGeneralLinks />
      <NavLink exact to='/@' className='nav-link'>
        <AccountIcon className='nav-icon' /> Profile
      </NavLink>
      <Button
        variant='contained'
        className='nav-link'
        size='medium'
        id='signout-btn'
        fullWidth
        onClick={handleSignoutRequest}>
        Sign Out <ArrowForward fontSize='inherit' />
      </Button>
    </Box>
  );
};

function NavGeneralLinks(props: any) {
  return (
    <>
      <NavLink
        exact
        to='/'
        isActive={(_, { pathname }) => ['/', '/home'].includes(pathname)}
        className='nav-link'>
        <HomeIcon className='nav-icon' />
        Home
      </NavLink>
      {props.forIndex && (
        <NavLink to='/about' className='nav-link'>
          <InfoIcon className='nav-icon' />
          About
        </NavLink>
      )}
      <Box component='span' marginX='1.5em'></Box>
      <NavLink exact to='/support' className='nav-link'>
        <HelpIcon className='nav-icon' />
        Support
      </NavLink>
    </>
  );
}

function ElevationScroll(props: {
  children: React.ReactElement;
  forLandingPage: boolean;
}) {
  const { children, forLandingPage } = props;

  let trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 40
  });

  return React.cloneElement(children, {
    elevation: trigger ? 8 : 0,
    className: trigger || !forLandingPage ? 'nav-background' : ''
  });
}

function TemporaryDrawer(props: any) {
  const [open, setOpen] = React.useState(Boolean);

  const toggleDrawer = (open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event?.type === 'keydown' &&
      ((event as React.KeyboardEvent)?.key === 'Tab' ||
        (event as React.KeyboardEvent)?.key === 'Shift')
    )
      return;

    setOpen(open);
  };

  return (
    <Box className='drawer'>
      <NavLink to='/search' className='nav-link'>
        <SearchIcon />
      </NavLink>
      <Dropdown className='dropdownN'>
        <Dropdown.Toggle  id="dropdown" as='p' >
        <Tooltip
          title="Notifications"
          placement="bottom"
        >
          <Badge badgeContent={4} color='secondary'>
            <NotificationsIcon />
          </Badge>
        </Tooltip>
        </Dropdown.Toggle>
        <Dropdown.Menu className='dropdown-contents'>
          <Notifications />
        </Dropdown.Menu>
      </Dropdown> 
      <IconButton
        edge='start'
        className='menu-button'
        color='inherit'
        onClick={toggleDrawer(true)}
        aria-label='menu'>
        <MenuIcon />
      </IconButton>
      <SwipeableDrawer
        className='drawer-nav'
        anchor='right'
        open={open}
        onOpen={toggleDrawer(true)}
        onClose={toggleDrawer(false)}>
        {props.children}
      </SwipeableDrawer>
    </Box>
  );
}

export default Nav;
