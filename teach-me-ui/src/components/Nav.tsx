import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { Button, Box, CircularProgress } from '@material-ui/core';

import { handleSignoutRequest } from '../functions';


const Nav = (props: any) => {
  return (
    <nav className='top-navbar'>
      <ul>
        <li>
          <Link to='/home'>Home</Link>
        </li>
        <li>
          <Link to='/about'>About</Link>
        </li>
        <li>
          <Box component='div' marginY='0.75em' width='7.5rem'>
            <Button
              variant='contained'
              size='medium'
              id='signout-btn'
              color='secondary'
              fullWidth
              onClick={handleSignoutRequest}>
              {props.signout.status === 'pending' ? (
                <CircularProgress color='inherit' size='1.75rem' thickness={5} />
              ) : (
                'SIGN OUT'
              )}
            </Button>
          </Box>
        </li>
      </ul>
    </nav>
  );
};

const mapStateToProps = (state: any) => {
  return {
    signout: state.signout
  };
};

export default connect(mapStateToProps)(Nav);
