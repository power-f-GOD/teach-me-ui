import React from 'react';
import { NavLink } from 'react-router-dom';

import { FAIcon } from '../../shared/Icons';

import Box from '@material-ui/core/Box';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';

import {
  handleSignoutRequest,
  getState,
  countNewNotifications,
  displayModal
} from '../../../functions';
import { NOTIFICATIONS } from '../../../constants';
import { UserData } from '../../../types';

import NavGeneralLinks from './GeneralLinks';

export default function MainNavMenu(props: any) {
  const { className, notifications } = props;
  const username = (getState().userData as UserData).username;
  const numberOfNewNotifications = countNewNotifications(
    notifications.data.notifications
  );

  return (
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

      <Tooltip title='View Profile'>
        <NavLink
          exact
          to={`/@${username}`}
          isActive={(_, location) => /\/@\w+/.test(location.pathname)}
          className='nav-link'>
          <FAIcon name='user-circle' />
          <Box component='span' className='nav-label'>
            Profile
          </Box>
        </NavLink>
      </Tooltip>

      <Tooltip title='See Notifications'>
        <NavLink
          to='#'
          className='nav-link'
          onClick={(e) => {
            e.preventDefault();
            displayModal(true, false, NOTIFICATIONS, {
              title: 'Notifications'
            });
          }}
          isActive={(match: any, location: any) => false}>
          <Badge color='secondary' badgeContent={numberOfNewNotifications}>
            <FAIcon name='bell' />
          </Badge>
          <Box component='span' className='nav-label'>
            Notifications
          </Box>
        </NavLink>
      </Tooltip>

      <Tooltip title='Sign Out'>
        <NavLink
          to='/'
          className='nav-link mt-5'
          onClick={(e) => {
            e.preventDefault();
            handleSignoutRequest();
          }}
          activeClassName=''>
          <FAIcon name='sign-out-alt' />
          <Box component='span' className='nav-label'>
            Sign Out
          </Box>
        </NavLink>
      </Tooltip>
    </Box>
  );
}