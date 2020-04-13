import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

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
import { SignupPropsState } from '../constants/interfaces';
import {
  handleSignupInputChange,
  handleSignupRequest
} from '../functions/signup';
import CircularProgress from '@material-ui/core/CircularProgress';

export const refs: any = {
  firstnameInput: React.createRef<HTMLInputElement>(),
  lastnameInput: React.createRef<HTMLInputElement>(),
  usernameInput: React.createRef<HTMLInputElement>(),
  emailInput: React.createRef<HTMLInputElement>(),
  passwordInput: React.createRef<HTMLInputElement>()
};

const Signup = (props: SignupPropsState) => {
  const classes = useSignupStyles();
  const [passwordVisible, setPasswordVisible] = useState(Boolean);

  const { isAuthenticated } = props.auth;

  if (isAuthenticated) {
    return <Redirect to='/' />;
  }

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

      <form
        noValidate
        autoComplete='on'
        onSubmit={(e: any) => e.preventDefault()}>
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
                error={props.firstname.err}
                value={props.firstname.value}
                required
                variant='outlined'
                id='firstname'
                label='First name'
                size='small'
                autoComplete='given-name'
                inputRef={refs.firstnameInput}
                helperText={props.firstname.helperText}
                fullWidth
                onChange={handleSignupInputChange}
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
                required
                value={props.lastname.value}
                error={props.lastname.err}
                variant='outlined'
                id='lastname'
                label='Last name'
                size='small'
                autoComplete='family-name'
                inputRef={refs.lastnameInput}
                helperText={props.lastname.helperText}
                fullWidth
                onChange={handleSignupInputChange}
              />
            </Box>
          </Grid>

          <Box component='div' marginY='0.25em' minWidth='100%'>
            <TextField
              required
              value={props.username.value}
              error={props.username.err}
              variant='outlined'
              id='username'
              label='Username'
              size='small'
              inputRef={refs.usernameInput}
              helperText={props.username.helperText}
              fullWidth
              onChange={handleSignupInputChange}
            />
          </Box>

          <Box component='div' marginY='0.25em' minWidth='100%'>
            <TextField
              required
              value={props.email.value}
              error={props.email.err}
              variant='outlined'
              id='email'
              label='Email'
              size='small'
              type='email'
              autoComplete='email'
              inputRef={refs.emailInput}
              helperText={props.email.helperText}
              fullWidth
              onChange={handleSignupInputChange}
            />
          </Box>

          <Box component='div' marginY='0.25em' minWidth='100%'>
            <TextField
              required
              value={props.password.value}
              error={props.password.err}
              variant='outlined'
              id='password'
              label='Password'
              type={passwordVisible ? 'text' : 'password'}
              size='small'
              autoComplete='new-password'
              inputRef={refs.passwordInput}
              helperText={props.password.helperText}
              fullWidth
              onChange={handleSignupInputChange}
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

          <Box component='div' marginY='0.25em' minWidth='100%'>
            <Button
              variant='contained'
              size='large'
              disabled={props.signup.status === 'pending'}
              id='sign-up'
              type='submit'
              color='primary'
              fullWidth
              onClick={handleSignupRequest}>
              {props.signup.status === 'pending' ? (
                <CircularProgress color='inherit' size={28} />
              ) : (
                'SIGN UP'
              )}
            </Button>
          </Box>
          <Box
            className={`${classes.statusFeedback} ${
              props.signup.err ? 'Mui-error' : 'success'
            }`}
            marginY='0.25em'>
            {props.signup.statusText || ' '}
          </Box>
        </Grid>
      </form>
      <Box marginY='0.5em'>
        <Typography component='div' align='center'>
          Have a Teach Me account? <Link to='/signin'>Sign in here!</Link>
        </Typography>
      </Box>
    </Grid>
  );
};

const mapStateToProps = (state: any) => {
  return {
    firstname: state.firstname,
    lastname: state.lastname,
    username: state.username,
    email: state.email,
    password: state.password,
    signup: state.signup,
    auth: state.auth
  };
};

export default connect(mapStateToProps)(Signup);
