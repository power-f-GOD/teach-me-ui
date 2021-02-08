import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';

import TemporaryDrawer from './TemporaryDrawer';
import ElevationScroll from './ElevationScroll';
import MainNav from './Main.Nav';
import MainNavMenu from './Main.NavMenu';
import IndexNav from './Index.Nav';
import ProfileLink from './ProfileLink';
import { FetchState, AuthState } from '../../../types';
import { inProfile } from '../../../utils';

const Nav = (props: {
  windowWidth: number;
  notifications: FetchState<{ notifications: any[]; entities: any }>;
  auth: AuthState;
  for: string;
  location: Location;
}) => {
  const { windowWidth, location, auth } = props;
  const isAuthenticated = auth.isAuthenticated;
  const forIndexComponent = !isAuthenticated && props.for === 'index';
  const forProfile = inProfile ? inProfile(location.pathname) : false; // attempt to fix build failure
  const transparentizeNavBar =
    (forIndexComponent && /\/(index)?$/.test(location.pathname)) || forProfile;

  return (
    <Box component='nav'>
      <ElevationScroll
        {...props}
        transparentizeNavBar={
          transparentizeNavBar && !/404/.test(props.location.pathname)
        }>
        <AppBar position='fixed' className='mobile-width'>
          <Container>
            <Toolbar className='nav-toolbar'>
              <Link to='/' className='order-1 order-md-0'>
                <Box component='h3' className='logo gradient'>
                  Kanyimuta!
                </Box>
              </Link>
              {windowWidth >= 768 && (
                <>
                  {forIndexComponent ? (
                    <IndexNav
                      {...props}
                      className='app-bar-links order-2 order-md-1'
                    />
                  ) : (
                    <MainNav
                      {...props}
                      className='app-bar-links order-2 order-md-1'
                    />
                  )}
                </>
              )}

              {windowWidth < 768 && (
                <TemporaryDrawer
                  className={`${
                    isAuthenticated ? 'order-0' : 'order-2'
                  } order-md-2`}>
                  {forIndexComponent ? (
                    <IndexNav {...props} />
                  ) : (
                    <MainNavMenu {...props} />
                  )}
                </TemporaryDrawer>
              )}

              {windowWidth < 768 && <ProfileLink className='ml-auto' />}
            </Toolbar>
          </Container>
        </AppBar>
      </ElevationScroll>
    </Box>
  );
};

const mapStateToProps = ({
  notifications,
  windowWidth,
  auth
}: {
  notifications: FetchState<{ notifications: any[]; entities: any }>;
  windowWidth: number;
  auth: AuthState;
}) => ({ notifications, windowWidth, auth });

export default connect(mapStateToProps)(Nav);
