import React from 'react';
import { NavLink } from 'react-router-dom';

import { FAIcon } from '../../shared/Icons';

import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';

export default function NavGeneralLinks(props: any) {
  return (
    <>
      <Tooltip title='Go Home'>
        <NavLink
          exact
          to='/'
          isActive={(_, { pathname }) => ['/', '/home'].includes(pathname)}
          className='nav-link'>
          <FAIcon name='home' />
          <Box component='span' className='nav-label'>
            Home
          </Box>
        </NavLink>
      </Tooltip>

      {props.forIndex ? (
        <>
          <Tooltip title='Know About Us'>
            <NavLink to='/about' className='nav-link'>
              <FAIcon name='info-circle' />
              <Box component='span' className='nav-label'>
                About
              </Box>
            </NavLink>
          </Tooltip>
          <Tooltip title='Seek Support'>
            <NavLink to='/support' className='nav-link'>
              <FAIcon name='question' />
              <Box component='span' className='nav-label'>
                Support
              </Box>
            </NavLink>
          </Tooltip>
        </>
      ) : (
        <Tooltip title='View Question &amp; Answer discussions'>
          <NavLink to='/questions' className='nav-link'>
            <FAIcon name='comments' />
            <Box component='span' className='nav-label'>
              Q &amp; A
            </Box>
          </NavLink>
        </Tooltip>
      )}
      <Box component='span' marginX='1.5em' />
      <Tooltip title='Seek Support'>
        <NavLink exact to='/support' className='nav-link d-none'>
          <FAIcon name='question-circle' />
          <Box component='span' className='nav-label ml-3'>
            Support
          </Box>
        </NavLink>
      </Tooltip>
    </>
  );
}
