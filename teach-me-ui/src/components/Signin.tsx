import React, { useState } from 'react';
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
// import { Typography, Grid, TextField, Box, InputAdornment, IconButton } from '@material-ui/core';
// import { Visibility, VisibilityOff } from '@material-ui/icons';

import { useSigninStyles } from '../styles';

const Signin = () => {
  const classes = useSigninStyles();
  const [passwordVisible, setPasswordVisible] = useState(Boolean);

  return (
    <Grid
      className={`${classes.root} fade-in`}
      container
      justify='center'
      direction='column'>
      <Typography component='h2' variant='h6'>
        <Box marginY='0.5em' fontSize='1.25rem' fontWeight={900}>
          Sign In
        </Box>
      </Typography>

      <Box component='div' marginY='0.5em'>
        <TextField
          // error
          variant='outlined'
          id='username'
          label='Username or Email'
          fullWidth
        />
      </Box>
      <Box component='div' marginY='0.5em'>
        <TextField
          // error
          variant='outlined'
          id='password'
          label='Password'
          type={passwordVisible ? 'text' : 'password'}
          helperText={true ? ' ' : 'Incorrect email or password.'}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  aria-label='toggle password visibility'
                  onClick={() => setPasswordVisible(!passwordVisible)}>
                  {passwordVisible ? <VisibilityOff /> : <Visibility />}
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
          SIGN IN
        </Button>
      </Box>
      <Box marginY='1em'>
        <Typography component='div' align='center'>
          Don't have an account yet? <Link to='/signup'>Sign up here!</Link>
        </Typography>
      </Box>
    </Grid>
  );
};

export default Signin;
