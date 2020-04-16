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
import CircularProgress from '@material-ui/core/CircularProgress';

import { SigninPropsState } from '../constants';
import { handleSigninRequest, handleSigninInputChange } from '../functions';

export const refs: any = {
  idInput: React.createRef<HTMLInputElement>(),
  passwordInput: React.createRef<HTMLInputElement>()
};

const Signin = (props: SigninPropsState) => {
  const [passwordVisible, setPasswordVisible] = useState(Boolean);
  const { isAuthenticated } = props.auth;
  const { from } = props.location?.state || { from: { pathname: '/' } };

  if (isAuthenticated) {
    return <Redirect to={from} />;
  }

  return (
    <Grid
      className='landing-form-wrapper fade-in'
      container
      justify='center'
      direction='column'>
      <Typography component='h2' variant='h6'>
        <Box marginY='0.75em' fontSize='1.25rem' fontWeight={900}>
          Sign In
        </Box>
      </Typography>

      <form
        noValidate
        autoComplete='on'
        onSubmit={(e: any) => e.preventDefault()}>
        <Box component='div' marginY='0.45em'>
          <TextField
            value={props.signinId.value}
            error={props.signinId.err}
            variant='outlined'
            id='signin-id'
            required
            label='Email address'
            type='email'
            autoComplete='email'
            inputRef={refs.idInput}
            helperText={props.signinId.helperText}
            fullWidth
            onChange={handleSigninInputChange}
          />
        </Box>
        <Box component='div' marginY='0.45em'>
          <TextField
            value={props.signinPassword.value}
            error={props.signinPassword.err}
            variant='outlined'
            id='signin-password'
            required
            label='Password'
            type={passwordVisible ? 'text' : 'password'}
            autoComplete='new-password'
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
            onClick={handleSigninRequest}>
            {props.signin.status === 'pending' ? (
              <CircularProgress color='inherit' size={28} />
            ) : (
              'SIGN IN'
            )}
          </Button>
        </Box>
      </form>
      <Box marginY='1em'>
        <Typography component='div' align='center'>
          New to Teach Me? <Link to='/signup'>Sign up here!</Link>
        </Typography>
      </Box>
    </Grid>
  );
};

const mapStateToProps = (state: any) => {
  return {
    signinId: state.signinId,
    signinPassword: state.signinPassword,
    signin: state.signin,
    auth: state.auth
  };
};

export default connect(mapStateToProps)(Signin);
