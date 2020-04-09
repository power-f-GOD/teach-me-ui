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
import { handleInputChange, handleFormSubmission } from '../functions/signup';

export const refs: any = {
  firstnameInput: React.createRef<HTMLInputElement>(),
  lastnameInput: React.createRef<HTMLInputElement>(),
  usernameInput: React.createRef<HTMLInputElement>(),
  emailInput: React.createRef<HTMLInputElement>(),
  passwordInput: React.createRef<HTMLInputElement>(),
};

const Signup = (props: SignupPropsState) => {
  const classes = useSignupStyles();
  const [passwordVisible, setPasswordVisible] = useState(Boolean);

  if (props.signup.success && props.signup.status === 'fulfilled') {
    return <Redirect to='/' />;
  }

  return (
    <Grid
      className={`${classes.root} fade-in`}
      container
      justify='center'
      direction='column'>
      <Typography component='h2' variant='h6'>
        <Box marginY='0.35em' fontSize='1.25rem' fontWeight={900}>
          Sign Up
        </Box>
      </Typography>

      <form noValidate autoComplete='on'>
        <Grid justify='space-between' container>
          <Grid
            item
            xs={12}
            sm={6}
            md={12}
            lg={6}
            className={classes.flexBasisHalved}>
            <Box marginY='0.35em'>
              <TextField
                error={props.firstname.err}
                required
                variant='outlined'
                id='firstname'
                label='First name'
                size='small'
                inputRef={refs.firstnameInput}
                helperText={props.firstname.helperText}
                fullWidth
                onChange={handleInputChange}
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
            <Box marginY='0.35em'>
              <TextField
                required
                error={props.lastname.err}
                variant='outlined'
                id='lastname'
                label='Last name'
                size='small'
                inputRef={refs.lastnameInput}
                helperText={props.lastname.helperText}
                fullWidth
                onChange={handleInputChange}
              />
            </Box>
          </Grid>

          <Box component='div' marginY='0.35em' minWidth='100%'>
            <TextField
              required
              error={props.username.err}
              variant='outlined'
              id='username'
              label='Username'
              size='small'
              inputRef={refs.usernameInput}
              helperText={props.username.helperText}
              fullWidth
              onChange={handleInputChange}
            />
          </Box>

          <Box component='div' marginY='0.35em' minWidth='100%'>
            <TextField
              required
              error={props.email.err}
              variant='outlined'
              id='email'
              label='Email'
              size='small'
              inputRef={refs.emailInput}
              helperText={props.email.helperText}
              fullWidth
              onChange={handleInputChange}
            />
          </Box>

          <Box component='div' marginY='0.35em' minWidth='100%'>
            <TextField
              required
              error={props.password.err}
              variant='outlined'
              id='password'
              label='Password'
              type={passwordVisible ? 'text' : 'password'}
              size='small'
              inputRef={refs.passwordInput}
              helperText={props.password.helperText}
              fullWidth
              onChange={handleInputChange}
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

          <Box component='div' marginY='0.35em' minWidth='100%'>
            <Button
              variant='contained'
              size='large'
              disabled={props.signup.status === 'pending'}
              id='sign-up'
              color='primary'
              fullWidth
              onClick={handleFormSubmission}>
              {props.signup.status === 'pending'
                ? 'Signing you up...'
                : 'SIGN UP'}
            </Button>
          </Box>
          <Box
            className={`${classes.statusFeedback} ${
              props.signup.err ? 'Mui-error' : 'success'
            }`}
            marginY='0.35em'>
            {props.signup.statusMsg || ' '}
          </Box>
        </Grid>
      </form>
      <Box marginY='0.5em'>
        <Typography component='div' align='center'>
          Signed up already? <Link to='/signin'>Sign in here!</Link>
        </Typography>
      </Box>
    </Grid>
  );
};

const mapStateToProps = (state: SignupPropsState) => {
  return {
    ...state,
  };
};

export default connect(mapStateToProps)(Signup);
