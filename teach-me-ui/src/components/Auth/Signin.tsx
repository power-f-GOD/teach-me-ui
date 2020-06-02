import React, { useState, useMemo } from 'react';
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
import Checkbox from '@material-ui/core/Checkbox';

import { SigninPropsState } from '../../constants';
import { handleSigninRequest, handleSigninInputChange } from '../../functions';

export const refs: any = {
  idInput: React.createRef<HTMLInputElement>(),
  passwordInput: React.createRef<HTMLInputElement>()
};

const Signin = (props: SigninPropsState) => {
  const [passwordVisible, setPasswordVisible] = useState(Boolean);
  const { isAuthenticated } = props.auth;
  const { from } = props.location?.state || { from: { pathname: '/' } };

  const inputProps = useMemo(() => {
    return {
      onKeyPress: (e: any) => {
        if (e.key === 'Enter') {
          e.target.blur();
        }
      }
    }
  }, []);

  if (isAuthenticated) {
    return <Redirect to={from} />;
  }

  return (
    <Grid
      className='auth-form-wrapper fade-in'
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
            label='Username or Email'
            type='email'
            autoComplete='username'
            inputRef={refs.idInput}
            helperText={props.signinId.helperText}
            fullWidth
            onChange={handleSigninInputChange}
            inputProps={inputProps}
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
            autoComplete='current-password'
            inputRef={refs.passwordInput}
            helperText={props.signinPassword.helperText}
            fullWidth
            onChange={handleSigninInputChange}
            inputProps={inputProps}
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

        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          component='div'>
          <Box
            component='label'
            display='flex'
            className='flex-basis-halved'
            alignItems='center'>
            <Checkbox
              defaultChecked
              color='primary'
              inputProps={{ 'aria-label': 'remember me' }}
            />
            <Box component='div'>Remember me</Box>
          </Box>
          <Box component='div' textAlign='right' marginLeft='10px'>
            <Link to='#!'>Forgot password?</Link>
          </Box>
        </Box>

        <Box component='div' marginY='0.85em'>
          <Button
            variant='contained'
            size='large'
            id='signin-btn'
            className='major-button'
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
          New to Kanyimuta? <Link to='/signup'>Sign up here!</Link>
        </Typography>
      </Box>
    </Grid>
  );
};

const mapStateToProps = ({ signinId, signinPassword, signin, auth }: any) => {
  return {
    signinId,
    signinPassword,
    signin,
    auth
  };
};

export default connect(mapStateToProps)(Signin);
