import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';

import { FAIcon } from '../../shared/Icons';
import NavGeneralLinks from './GeneralLinks';

import { countNewNotifications, displayModal } from '../../../functions';
import { NOTIFICATIONS } from '../../../constants';
import { UserData, FetchState, AuthState } from '../../../types';
import { dispatch } from '../../../appStore';
import { getNotifications } from '../../../actions';
import ProfileLink from './ProfileLink';

interface MainNavProps {
  userData: UserData;
  isAuthenticated: boolean;
  className: string;
  notifications: FetchState<{ notifications: any[]; entities: any[] }>;
}

const MainNav = (props: MainNavProps) => {
  const { isAuthenticated, className, notifications } = props;
  const numOfNewNotifs = countNewNotifications(
    notifications.data?.notifications || []
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getNotifications(Date.now()));
    }
  }, [isAuthenticated]);

  return (
    <>
      <Box className={`nav-links-wrapper ${className}`}>
        <Tooltip title='Search Kanyimuta'>
          <NavLink to='/search' className='nav-link'>
            <FAIcon name='search' />
            <Box component='span' className='nav-label'>
              Search
            </Box>
          </NavLink>
        </Tooltip>

        <NavGeneralLinks />

        <Tooltip title='See Notifications'>
          <NavLink
            to='#modal'
            className={`nav-link ${numOfNewNotifs ? 'new-notification' : ''}`}
            onClick={(e: any) => {
              e.preventDefault();
              displayModal(true, false, NOTIFICATIONS, {
                title: 'Notifications'
              });
            }}
            activeClassName=''>
            <Badge color='secondary' badgeContent={numOfNewNotifs}>
              <FAIcon name='bell' />
              <Box component='span' className='nav-label'>
                Notifications
              </Box>
            </Badge>
          </NavLink>
        </Tooltip>

        <Box component='span' marginX='1.25em' />

        {/* Profile Link */}
        <ProfileLink />
      </Box>
    </>
  );
};

export default connect((state: { userData: UserData; auth: AuthState }) => ({
  userData: state.userData,
  isAuthenticated: state.auth.isAuthenticated!
}))(MainNav);
