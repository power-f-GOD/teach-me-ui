import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import { handleForgotPasswordRequest, validateEmailFn } from '../../functions';

const ForgotPassword = (props: any) => {
  const [email, setEmail] = useState<string>('');

  const onChange = (e: any) => {
    setEmail(e.target.value);
  };

  const onSubmit = (e: any) => {
    handleForgotPasswordRequest(email);
    setEmail('');
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
          Forgot Password
        </Box>
      </Typography>

      <form
        noValidate
        autoComplete='on'
        onSubmit={(e: any) => e.preventDefault()}>
        <Box component='div' marginY='0.45em'>
          <TextField
            value={email}
            variant='outlined'
            required
            label='Email address'
            type='email'
            autoComplete='email'
            fullWidth
            onChange={onChange}
            inputProps={inputProps}
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
              !validateEmailFn(email)
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

export default connect(mapStateToProps)(ForgotPassword);
