import React, { useState, useMemo } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import CircularProgress from '@material-ui/core/CircularProgress';

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
    };
  }, []);

  React.useEffect(() => () => window.scrollTo(0, 0), []);

  if (isAuthenticated) {
    return <Redirect to={from} />;
  }

  return (
    <Box
      width='23rem'
      className='auth-form-wrapper fade-in d-flex flex-column justify-content-center px-1'>
      <Box component='h2' marginY='0.75em' fontSize='1.25rem' fontWeight={900}>
        Sign In
      </Box>

      <form
        noValidate
        autoComplete='on'
        onSubmit={(e: any) => e.preventDefault()}>
        <Box component='div' marginY='0.45em'>
          <TextField
            error={props.signinId.err}
            variant='outlined'
            id='signin-id'
            required
            label='Username or Email'
            type='email'
            defaultValue={
              props.signinId.value ||
              JSON.parse(localStorage.kanyimuta || '{}')?.username ||
              ''
            }
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
          justifyContent='flex-end'
          alignItems='center'
          component='div'>
          <Box component='div' textAlign='right' marginLeft='10px'>
            <Link to='/forgot-password'>Forgot password?</Link>
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
      <Box marginY='1em' className='text-center'>
        New to Kanyimuta? <Link to='/signup'>Sign up here!</Link>
      </Box>
    </Box>
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
