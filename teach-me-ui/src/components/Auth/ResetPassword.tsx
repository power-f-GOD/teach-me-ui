import React, { useState, useMemo, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  handleResetPasswordRequest,
  validateResetPasswordFn
} from '../../functions';

import { BasicInputState, basicInputState } from '../../constants';

const ResetPassword = (props: any) => {
  const [newPassword, setNewPassword] = useState<BasicInputState>(
    basicInputState
  );
  const [confirmPassword, setConfirmPassword] = useState<BasicInputState>(
    basicInputState
  );
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputState: BasicInputState = validateResetPasswordFn(e.target.value);
    switch (e.target.id) {
      case 'new-password':
        setNewPassword(inputState);
        break;
      case 'confirm-password':
        setConfirmPassword(inputState);
    }
  };

  const onSubmit = (e: any) => {
    handleResetPasswordRequest(
      newPassword.value as string,
      props.match.params.token,
      () => {
        setNewPassword(basicInputState);
        setConfirmPassword(basicInputState);
        props.history.push('/signin');
      }
    );
  };

  const inputProps = useMemo(() => {
    return {
      onKeyPress: (e: any) => {
        if (e.key === 'Enter') {
          e.target.blur();
        }
      }
    };
  }, []);

  return (
    <Box
      width='25rem'
      className='auth-form-wrapper fade-in d-flex flex-column justify-content-center'>
      <Typography component='h2' variant='h6'>
        <Box marginY='0.75em' fontSize='1.25rem' fontWeight={900}>
          Reset Password
        </Box>
      </Typography>

      <form
        noValidate
        autoComplete='on'
        onSubmit={(e: any) => e.preventDefault()}>
        <Box component='div' marginY='0.45em'>
          <TextField
            value={newPassword.value as string}
            error={newPassword.err as boolean}
            variant='outlined'
            id='new-password'
            required
            label='Password'
            type={passwordVisible ? 'text' : 'password'}
            autoComplete='current-password'
            helperText={newPassword.helperText as string}
            fullWidth
            onChange={onChange}
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
        <Box component='div' marginY='0.45em'>
          <TextField
            value={confirmPassword.value as string}
            error={confirmPassword.err as boolean}
            variant='outlined'
            id='confirm-password'
            required
            label='Password'
            type={passwordVisible ? 'text' : 'password'}
            autoComplete='current-password'
            helperText={confirmPassword.helperText as string}
            fullWidth
            onChange={onChange}
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
        <Box component='div' marginY='0.85em' marginTop='1.5em'>
          <Button
            variant='contained'
            size='large'
            className='major-button'
            color='primary'
            type='submit'
            fullWidth
            disabled={
              props.forgotPasswordStatus.status === 'pending' ||
              validateResetPasswordFn(newPassword.value as string).err ||
              validateResetPasswordFn(confirmPassword.value as string).err ||
              newPassword.value !== confirmPassword.value
            }
            onClick={onSubmit}>
            {props.forgotPasswordStatus.status === 'pending' ? (
              <CircularProgress color='inherit' size={28} />
            ) : (
              'Recover Password'
            )}
          </Button>
        </Box>
      </form>
      <Box marginY='1em'>
        <Typography component='div' align='center'>
          Back to <Link to='/signin'>Sign in</Link>
        </Typography>
      </Box>
    </Box>
  );
};

const mapStateToProps = ({ forgotPasswordStatus }: any) => {
  return {
    forgotPasswordStatus
  };
};

export default connect(mapStateToProps)(ResetPassword);
