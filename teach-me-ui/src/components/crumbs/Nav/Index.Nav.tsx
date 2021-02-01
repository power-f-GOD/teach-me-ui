import React from 'react';
import { NavLink } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';

import { FAIcon } from '../../shared/Icons';

import NavGeneralLinks from './GeneralLinks';

export default function IndexNav(props: any) {
  return (
    <Box className={`nav-links-wrapper ${props?.className}`}>
      <Tooltip title='Search Kanyimuta'>
        <NavLink to='/search' className='nav-link'>
          <FAIcon name='search' />
          <Box component='span' className='nav-label'>
            Search
          </Box>
        </NavLink>
      </Tooltip>

      <NavGeneralLinks forIndex />
      <Tooltip title='Sign In'>
        <NavLink to='/signin' className='nav-link'>
          <FAIcon name='sign-in-alt' />
          <Box component='span' className='nav-label'>
            Sign In
          </Box>
        </NavLink>
      </Tooltip>
    </Box>
  );
}
