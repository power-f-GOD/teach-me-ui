import React, { useState, ChangeEvent } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

// import 'date-fns';
// import DateFnsUtils from '@date-io/date-fns';
import MomentUtils from '@date-io/moment';

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
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';

import { SignupPropsState } from '../constants/interfaces';
import {
  handleSignupInputChange,
  handleSignupRequest
} from '../functions/signup';

export const refs: any = {
  firstnameInput: React.createRef<HTMLInputElement>(),
  lastnameInput: React.createRef<HTMLInputElement>(),
  usernameInput: React.createRef<HTMLInputElement>(),
  emailInput: React.createRef<HTMLInputElement>(),
  dobInput: React.createRef<HTMLInputElement>(),
  passwordInput: React.createRef<HTMLInputElement>(),
  universityInput: React.createRef<HTMLInputElement>(),
  departmentInput: React.createRef<HTMLInputElement>(),
  levelInput: React.createRef<HTMLInputElement>()
};

const Signup = (props: SignupPropsState) => {
  const [passwordVisible, setPasswordVisible] = useState(Boolean);

  const { isAuthenticated } = props.auth;

  if (isAuthenticated) {
    return <Redirect to='/' />;
  }

  return (
    <Grid
      className='auth-form-wrapper fade-in'
      container
      justify='center'
      direction='column'>
      <Typography component='h2' variant='h6'>
        <Box marginY='0.5em' fontSize='1.25rem' fontWeight={900}>
          Basic info:
        </Box>
      </Typography>

      <form
        noValidate
        autoComplete='on'
        onSubmit={(e: any) => e.preventDefault()}>
        <Grid justify='space-between' container>
          <Grid item xs={12} sm={6} className='flex-basis-halved'>
            <Box marginY='0.25em'>
              <TextField
                error={props.firstname.err}
                required
                variant='outlined'
                id='firstname'
                label='First name'
                size='medium'
                autoComplete='given-name'
                inputRef={refs.firstnameInput}
                helperText={props.firstname.helperText}
                fullWidth
                onChange={handleSignupInputChange}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={5} className='flex-basis-halved'>
            <Box marginY='0.25em'>
              <TextField
                required
                error={props.lastname.err}
                variant='outlined'
                id='lastname'
                label='Last name'
                size='medium'
                autoComplete='family-name'
                inputRef={refs.lastnameInput}
                helperText={props.lastname.helperText}
                fullWidth
                onChange={handleSignupInputChange}
              />
            </Box>
          </Grid>

          <Grid justify='space-between' container>
            <Grid item xs={12} sm={6} className='flex-basis-halved'>
              <Box component='div' marginY='0.25em' minWidth='100%'>
                <TextField
                  required
                  error={props.username.err}
                  variant='outlined'
                  id='username'
                  label='Username'
                  size='medium'
                  autoComplete='nickname'
                  inputRef={refs.usernameInput}
                  helperText={props.username.helperText}
                  fullWidth
                  onChange={handleSignupInputChange}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={5} className='flex-basis-halved'>
              <Box component='div' marginY='0.25em' minWidth='100%'>
                <TextField
                  required
                  error={props.email.err}
                  variant='outlined'
                  id='email'
                  label='Email'
                  size='medium'
                  type='email'
                  autoComplete='username'
                  inputRef={refs.emailInput}
                  helperText={props.email.helperText}
                  fullWidth
                  onChange={handleSignupInputChange}
                />
              </Box>
            </Grid>
          </Grid>

          <Grid justify='space-between' container>
            <Grid item xs={12} sm={6} className='flex-basis-halved'>
              <Box component='div' marginY='0.25em' minWidth='100%'>
                <DatePicker dob={props.dob} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={5} className='flex-basis-halved'>
              <Box component='div' marginY='0.25em' minWidth='100%'>
                <TextField
                  required
                  error={props.password.err}
                  variant='outlined'
                  id='password'
                  label='Password'
                  type={passwordVisible ? 'text' : 'password'}
                  size='medium'
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
            </Grid>
          </Grid>

          <Typography component='h2' variant='h6'>
            <Box marginY='0.5em' fontSize='1.25rem' fontWeight={900}>
              Academic info:
            </Box>
          </Typography>

          <Grid justify='space-between' container>
            <Grid item xs={12} sm={6} className='flex-basis-halved'>
              <Box component='div' marginY='0.25em' minWidth='100%'>
                <TextField
                  required
                  error={props.university.err}
                  variant='outlined'
                  id='university'
                  label='University'
                  size='medium'
                  // type='text'
                  autoComplete='university'
                  inputRef={refs.universityInput}
                  helperText={props.university.helperText}
                  fullWidth
                  onChange={handleSignupInputChange}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={5} className='flex-basis-halved'>
              <Box component='div' marginY='0.25em' minWidth='100%'>
                <TextField
                  required
                  error={props.department.err}
                  variant='outlined'
                  id='department'
                  label='Department'
                  size='medium'
                  // type='email'
                  autoComplete='department'
                  inputRef={refs.departmentInput}
                  helperText={props.department.helperText}
                  fullWidth
                  onChange={handleSignupInputChange}
                />
              </Box>
            </Grid>
          </Grid>

          <Grid justify='space-between' container>
            <Grid item xs={12} sm={6} className='flex-basis-halved'>
              <Box component='div' marginY='0.25em' minWidth='100%'>
                <TextField
                  required
                  error={props.level.err}
                  variant='outlined'
                  id='level'
                  label='Level (E.g. 100)'
                  size='medium'
                  type='number'
                  autoComplete='level'
                  inputRef={refs.levelInput}
                  helperText={props.level.helperText}
                  fullWidth
                  onChange={handleSignupInputChange}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={5} className='flex-basis-halved'>
              <Box component='div' marginY='0.25em' minWidth='100%'>
                <Button
                  variant='contained'
                  size='large'
                  disabled={props.signup.status === 'pending'}
                  id='sign-up'
                  className='major-button'
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
            </Grid>
          </Grid>
        </Grid>
      </form>
      <Box marginY='1em'>
        <Typography component='div' align='center'>
          Have a an account? <Link to='/signin'>Sign in here!</Link>
        </Typography>
      </Box>
    </Grid>
  );
};

function DatePicker({ dob }: any) {
  const [selectedDate, setSelectedDate] = React.useState<any>(
    null
  );

  const handleDateChange = (date: any, value: any) => {
    //this is a hack as there is no working way of getting the target input element in the onChange eventListener in KeyboardDatePicker below
    const event = {
      target: {
        id: 'dob',
        value
      }
    } as ChangeEvent<any>;

    setSelectedDate(date);
    handleSignupInputChange(event);
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <KeyboardDatePicker
        // margin='normal'
        variant={'dialog'}
        id='dob'
        label='Date of Birth (DD/MM/YYYY)'
        format='DD/MM/yyyy'
        size='medium'
        autoOk
        disableFuture
        inputVariant='outlined'
        // inputProps={{
        //   id: 'dob',
        //   onChange:
        // }}
        value={selectedDate}
        error={dob.err}
        inputRef={refs.dobInput}
        helperText={dob.helperText}
        fullWidth
        onChange={handleDateChange}
        KeyboardButtonProps={{
          'aria-label': 'change date'
        }}
      />
    </MuiPickersUtilsProvider>
  );
}

const mapStateToProps = (state: any) => {
  return {
    firstname: state.firstname,
    lastname: state.lastname,
    username: state.username,
    email: state.email,
    dob: state.dob,
    password: state.password,
    university: state.university,
    department: state.department,
    level: state.level,
    signup: state.signup,
    auth: state.auth
  };
};

export default connect(mapStateToProps)(Signup);
