import React from 'react';
import { Link } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
// import {
//   Typography,
//   Grid,
//   TextField,
//   Box,
//   InputAdornment,
//   IconButton,
// } from '@material-ui/core';
// import { Visibility, VisibilityOff } from '@material-ui/icons';

import { useSignupStyles } from '../styles';

const Signin = () => {
  const classes = useSignupStyles();

  return (
    <Grid
      className={`${classes.root} fade-in`}
      container
      justify='center'
      direction='column'>
      <Typography component='h2' variant='h6'>
        <Box marginY='0.5em' fontSize='1.25rem' fontWeight={900}>
          Sign Up
        </Box>
      </Typography>

      <Grid justify='space-between' container>
        <Grid
          item
          xs={12}
          sm={6}
          md={12}
          lg={6}
          className={classes.flexBasisHalved}>
          <Box marginY='0.25em'>
            <TextField
              // error
              variant='outlined'
              id='firstname'
              label='First name'
              helperText=' '
              fullWidth
            />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          sm={5}
          md={12}
          lg={5}
          className={classes.flexBasisHalved}>
          <Box marginY='0.25em'>
            <TextField
              // error
              variant='outlined'
              id='lastname'
              label='Last name'
              helperText=' '
              fullWidth
            />
          </Box>
        </Grid>
      </Grid>

      <Box component='div' marginY='0.25em'>
        <TextField
          // error
          variant='outlined'
          id='username'
          label='Username'
          helperText=' '
          fullWidth
        />
      </Box>
      <Box component='div' marginY='0.25em'>
        <TextField
          // error
          variant='outlined'
          id='email'
          label='Email'
          helperText=' '
          fullWidth
        />
      </Box>

      <Box component='div' marginY='0.25em'>
        <TextField
          // error
          variant='outlined'
          id='password'
          label='Password'
          type='password'
          // size='small'
          helperText=' '
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton aria-label='toggle password visibility'>
                  {true ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box component='div' marginY='0.5em'>
        <Button
          variant='contained'
          size='large'
          id='sign-in'
          color='primary'
          fullWidth>
          SIGN UP
        </Button>
      </Box>
      <Box marginY='1em'>
        <Typography component='div' align='center'>
          Have an account already? <Link to='/signin'>Sign in!</Link>
        </Typography>
      </Box>
    </Grid>
  );
};

export default Signin;
