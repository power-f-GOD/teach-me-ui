import React from 'react';
import { Link } from 'react-router-dom';
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
import { SignupState } from '../constants/interfaces';
import { handleInputChange, handleFormSubmission } from '../functions/signup';

export const refs: any = {
  firstnameInput: React.createRef<any>(),
  lastnameInput: React.createRef<any>(),
  usernameInput: React.createRef<any>(),
  emailInput: React.createRef<any>(),
  passwordInput: React.createRef<any>(),
};

const Signup = (props: SignupState) => {
  const classes = useSignupStyles();

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
              error={props.validate.firstnameErr}
              required
              variant='outlined'
              id='firstname'
              label='First name'
              size='small'
              inputRef={refs.firstnameInput}
              helperText={props.validate.firstnameHelperText}
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
              error={props.validate.lastnameErr}
              variant='outlined'
              id='lastname'
              label='Last name'
              size='small'
              inputRef={refs.lastnameInput}
              helperText={props.validate.lastnameHelperText}
              fullWidth
              onChange={handleInputChange}
            />
          </Box>
        </Grid>

        <Box component='div' marginY='0.35em' minWidth='100%'>
          <TextField
            required
            error={props.validate.usernameErr}
            variant='outlined'
            id='username'
            label='Username'
            size='small'
            inputRef={refs.usernameInput}
            helperText={props.validate.usernameHelperText}
            fullWidth
            onChange={handleInputChange}
          />
        </Box>

        <Box component='div' marginY='0.35em' minWidth='100%'>
          <TextField
            required
            error={props.validate.emailErr}
            variant='outlined'
            id='email'
            label='Email'
            size='small'
            inputRef={refs.emailInput}
            helperText={props.validate.emailHelperText}
            fullWidth
            onChange={handleInputChange}
          />
        </Box>

        <Box component='div' marginY='0.35em' minWidth='100%'>
          <TextField
            required
            error={props.validate.passwordErr}
            variant='outlined'
            id='password'
            label='Password'
            type='password'
            size='small'
            inputRef={refs.passwordInput}
            helperText={props.validate.passwordHelperText}
            fullWidth
            onChange={handleInputChange}
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

        <Box component='div' marginY='0.35em' minWidth='100%'>
          <Button
            variant='contained'
            size='large'
            id='sign-up'
            color='primary'
            fullWidth
            onClick={handleFormSubmission}>
            SIGN UP
          </Button>
        </Box>
      </Grid>

      <Box marginY='1em'>
        <Typography component='div' align='center'>
          Signed up already? <Link to='/signin'>Sign in here!</Link>
        </Typography>
      </Box>
    </Grid>
  );
};

const mapStateToProps = (state: SignupState) => {
  return {
    ...state,
  };
};

export default connect(mapStateToProps)(Signup);
