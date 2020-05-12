/* eslint import/no-webpack-loader-syntax: off */

import React, { useState, useCallback, createRef, ChangeEvent } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

// import Worker from 'worker-loader!./worker.ts';

import { createMemo } from '../index';
import { SignupPropsState } from '../constants/interfaces';
import {
  handleSignupInputChange,
  handleSignupRequest
} from '../functions/signup';
import { dispatch } from '../functions';
import { validateUniversity, getMatchingInstitutions } from '../actions';

const Memoize = createMemo();

export const refs: any = {
  firstnameInput: createRef<HTMLInputElement>(),
  lastnameInput: createRef<HTMLInputElement>(),
  usernameInput: createRef<HTMLInputElement>(),
  emailInput: createRef<HTMLInputElement>(),
  dobInput: createRef<HTMLInputElement>(),
  passwordInput: createRef<HTMLInputElement>(),
  universityInput: createRef<HTMLInputElement>(),
  departmentInput: createRef<HTMLInputElement>(),
  levelInput: createRef<HTMLInputElement>()
};

const Signup = (props: SignupPropsState) => {
  const [passwordVisible, setPasswordVisible] = useState(Boolean);
  const [hideList, setHideList] = useState(Boolean);
  const { isAuthenticated } = props.auth;

  const handleUniversityChange = useCallback((e: any) => {
    dispatch(getMatchingInstitutions(e.target.value)(dispatch));
    handleSignupInputChange(e);
    setHideList(!e.target.value);
  }, []);

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
              <Memoize
                memoizedComponent={TextField}
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
              <Memoize
                memoizedComponent={TextField}
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
        </Grid>

        <Grid justify='space-between' container>
          <Grid item xs={12} sm={6} className='flex-basis-halved'>
            <Box component='div' marginY='0.25em' minWidth='100%'>
              <Memoize
                memoizedComponent={TextField}
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
              <Memoize
                memoizedComponent={TextField}
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
              <Memoize memoizedComponent={DatePicker} dob={props.dob} />
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
            <Box
              component='div'
              marginY='0.25em'
              minWidth='100%'
              className='university-input-wrapper'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={props.university.err}
                variant='outlined'
                id='university'
                label='University'
                size='medium'
                value={`${props.university.value ?? ''}`}
                autoComplete='university'
                inputRef={refs.universityInput}
                helperText={props.university.helperText}
                fullWidth
                onChange={handleUniversityChange}
              />
              <ClickAwayListener onClickAway={() => setHideList(true)}>
                <List
                  id='institutions'
                  className={`institutions-list custom-scroll-bar ${
                    props.university.value && !props.university.err && !hideList
                      ? 'open'
                      : 'close'
                  }`}
                  aria-label='institutions list'>
                  {props.matchingInstitutions?.data
                    ?.slice(0, 15)
                    .map((institution, key) => (
                      <ListItem
                        button
                        divider
                        key={key}
                        onClick={() => {
                          setHideList(true);
                          dispatch(
                            validateUniversity({
                              value: institution.name,
                              uid: institution.id
                            })
                          );
                        }}>
                        {(() => {
                          const country = `<span class='theme-color-tertiary-lighter'>${institution.country}</span>`;
                          const keyword = props.university.value;
                          const highlighted = `${institution.name.replace(
                            new RegExp(`(${keyword})`, 'i'),
                            `<span class='theme-color-secondary-darker'>$1</span>`
                          )}, ${country}`.replace(/<\/?script>/gi, '');

                          return (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: highlighted
                              }}></span>
                          );
                        })()}
                      </ListItem>
                    ))}
                </List>
              </ClickAwayListener>
            </Box>
          </Grid>
          <Grid item xs={12} sm={5} className='flex-basis-halved'>
            <Box component='div' marginY='0.25em' minWidth='100%'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={props.department.err}
                variant='outlined'
                id='department'
                label='Department'
                size='medium'
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
              <Memoize
                memoizedComponent={TextField}
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
          <Grid item xs={12} sm={5} className='flex-basis-halved' key='button'>
            <Box component='div' marginY='0.25em' minWidth='100%'>
              <Memoize
                memoizedComponent={Button}
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
                {/* </Button> */}
              </Memoize>
            </Box>
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
  const [selectedDate, setSelectedDate] = React.useState<any>(null);

  const handleDateChange = (date: any, value: any) => {
    setSelectedDate(date);

    //the following is a hack as there is no working way of getting the target input element event object in the onChange eventListener in KeyboardDatePicker below
    const event = {
      target: {
        id: 'dob',
        value
      }
    } as ChangeEvent<any>;

    handleSignupInputChange(event);
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <KeyboardDatePicker
        variant={'dialog'}
        id='dob'
        required
        label='Date of Birth (DD/MM/YYYY)'
        format='DD/MM/yyyy'
        size='medium'
        autoOk
        disableFuture
        inputVariant='outlined'
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
    matchingInstitutions: state.matchingInstitutions,
    signup: state.signup,
    auth: state.auth
  };
};

export default connect(mapStateToProps)(Signup);
