import React, { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import ArrowForward from '@material-ui/icons/ArrowForwardIosSharp';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/MenuRounded';
import SearchIcon from '@material-ui/icons/Search';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import NotificationsIcon from '@material-ui/icons/Notifications';
import HomeRoundedIcon from '@material-ui/icons/HomeRounded';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import HelpRoundedIcon from '@material-ui/icons/HelpRounded';
import Badge from '@material-ui/core/Badge';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';

import { 
  handleSignoutRequest,
  getState,
  countNewNotifications, displayModal
} from '../../functions';

import { UserData } from '../../constants';
import { dispatch } from '../../appStore';
import { getNotificationsRequest } from '../../actions';

const Nav = (props: any) => {
  const forIndexPage = /index/i.test(props.for);
  const forLandingPage =
    forIndexPage && /\/index|\/$|\/[^a-z]+$/i.test(window.location.href);

  return (
    <Box component='nav'>
      <ElevationScroll
        {...props}
        forLandingPage={
          forLandingPage && !/404/.test(window.location.pathname)
        }>
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
  const { isAuthenticated, className, getNotifications } = props;
  const username = (getState().userData as UserData).username;
  const numberOfNewNotifications = countNewNotifications(getNotifications.data.notifications);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getNotificationsRequest(Date.now())(dispatch));
    }
  }, [isAuthenticated]);

  return (
    <Box className={`nav-links-wrapper ${className}`}>
      <NavLink to='/search' className='nav-link'>
        <SearchIcon />
      </NavLink>

      <NavGeneralLinks />

      <NavLink
        exact
        to={`/@${username}`}
        isActive={(_, location) => /\/@\w+/.test(location.pathname)}
        className='nav-link'>
        <AccountCircleRoundedIcon className='nav-icon' />
      </NavLink>

      <NavLink 
        to='#' 
        className='nav-link' 
        onClick={(e: any) => {displayModal(true, false, 'NOTIFICATIONS', { title: 'Notifications' })}}
        isActive={(match: any, location: any) => false}>
        <Badge color='secondary' badgeContent={numberOfNewNotifications}>
          <NotificationsIcon />
        </Badge>
      </NavLink>

      <Box component='span' marginX='1em' />

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
}

function MainNavMenu(props: any) {
  const { className, getNotifications } = props;
  const username = (getState().userData as UserData).username;
  const numberOfNewNotifications = countNewNotifications(getNotifications.data.notifications);


  return (
    <Box className={`nav-links-wrapper ${className}`}>
      <NavLink to='/search' className='nav-link'>
        <SearchIcon />
        <Box component='span' className='nav-label ml-3'>
          Search
        </Box>
      </NavLink>

      <NavGeneralLinks />

      <NavLink
        exact
        to={`/@${username}`}
        isActive={(_, location) => /\/@\w+/.test(location.pathname)}
        className='nav-link'>
        <AccountCircleRoundedIcon className='nav-icon' />{' '}
        <Box component='span' className='nav-label ml-3'>
          Profile
        </Box>
      </NavLink>

      <NavLink 
        to='#' 
        className='nav-link' 
        onClick={(e: any) => {displayModal(true, false, 'NOTIFICATIONS', { title: 'Notifications' })}}
        isActive={(match: any, location: any) => false}>
        <Badge color='secondary' badgeContent={numberOfNewNotifications}>
          <NotificationsIcon />
        </Badge>
        <Box component='span' className='nav-label ml-3'>
          Notifications
        </Box>
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
}

function NavGeneralLinks(props: any) {
  return (
    <>
      <NavLink
        exact
        to='/'
        isActive={(_, { pathname }) => ['/', '/home'].includes(pathname)}
        className='nav-link'>
        <HomeRoundedIcon className='nav-icon' />
        <Box component='span' className='nav-label ml-3'>
          Home
        </Box>
      </NavLink>
      {props.forIndex && (
        <NavLink to='/about' className='nav-link d-none'>
          <InfoRoundedIcon className='nav-icon' />
          <Box component='span' className='nav-label ml-3'>
            About
          </Box>
        </NavLink>
      )}
      <Box component='span' marginX='1.5em' />
      <NavLink exact to='/support' className='nav-link d-none'>
        <HelpRoundedIcon className='nav-icon' />
        <Box component='span' className='nav-label ml-3'>
          Support
        </Box>
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

const mapStateToProps = ({ getNotifications }: any) => ({ getNotifications });

export default connect(mapStateToProps)(Nav);
