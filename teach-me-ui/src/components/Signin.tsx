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
import { connect } from 'react-redux';
import { authState, SigninPropsState } from '../constants';
import { handleSigninSubmission, handleSigninInputChange } from '../functions';

export const refs: any = {
  idInput: React.createRef<HTMLInputElement>(),
  passwordInput: React.createRef<HTMLInputElement>()
};

const Signin = (props: SigninPropsState) => {
  const classes = useSigninStyles();
  const [passwordVisible, setPasswordVisible] = useState(Boolean);

  return (
    <Grid
      className={`${classes.root} fade-in`}
      container
      justify='center'
      direction='column'>
      <Typography component='h2' variant='h6'>
        <Box marginY='0.75em' fontSize='1.25rem' fontWeight={900}>
          Sign In
        </Box>
      </Typography>

<<<<<<< HEAD
      <form
        noValidate
        autoComplete='on'
        onSubmit={(e: any) => e.preventDefault()}>
        <Box component='div' marginY='0.5em'>
          <TextField
            value={props.signinId.value}
            error={props.signinId.err}
            variant='outlined'
            id='signin-id'
            label='Username or Email'
            inputRef={refs.idInput}
            helperText={props.signinId.helperText}
            fullWidth
            onChange={handleSigninInputChange}
          />
        </Box>
        <Box component='div' marginY='0.5em'>
          <TextField
            value={props.signinPassword.value}
            error={props.signinPassword.err}
            variant='outlined'
            id='signin-password'
            label='Password'
            type={passwordVisible ? 'text' : 'password'}
            inputRef={refs.passwordInput}
            helperText={props.signinPassword.helperText}
            fullWidth
            onChange={handleSigninInputChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={() => setPasswordVisible(!passwordVisible)}>
                    {passwordVisible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
        <Box component='div' marginY='0.75em'>
          <Button
            variant='contained'
            size='large'
            id='signin-btn'
            color='primary'
            type='submit'
            fullWidth
            disabled={props.signin.status === 'pending'}
            onClick={handleSigninSubmission}>
            {props.signin.status === 'pending'
              ? 'SIGNING YOU IN...'
              : 'SIGN IN'}
          </Button>
        </Box>
        <Box
          className={`${classes.statusFeedback} ${
            props.signin.err ? 'Mui-error' : 'success'
          }`}
          marginY='0.35em'>
          {props.signin.statusMsg || ' '}
        </Box>
      </form>
=======
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
>>>>>>> Modify code base for signup validation et al.
      <Box marginY='1em'>
        <Typography component='div' align='center'>
          New to Teach Me? <Link to='/signup'>Sign up here!</Link>
        </Typography>
      </Box>
    </Grid>
  );
};

const mapStateToProps = (state: SigninPropsState) => {
  return {
    ...state,
    online: true,
    auth: authState
  };
};

export default connect(mapStateToProps)(Signin);
