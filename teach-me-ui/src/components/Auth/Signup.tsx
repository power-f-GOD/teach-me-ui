/* eslint import/no-webpack-loader-syntax: off */

import React, {
  useState,
  useCallback,
  useMemo,
  createRef,
  ChangeEvent
} from 'react';
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

import { SignupPropsState } from '../../constants/interfaces';
import {
  handleSignupInputChange,
  handleSignupRequest
} from '../../functions/signup';
import { dispatch } from '../../functions';
import {
  validateInstitution,
  getMatchingInstitutions,
  getMatchingDepartments,
  getMatchingLevels,
  validateDepartment,
  validateLevel
} from '../../actions';

export const refs: any = {
  firstnameInput: createRef<HTMLInputElement>(),
  lastnameInput: createRef<HTMLInputElement>(),
  usernameInput: createRef<HTMLInputElement>(),
  emailInput: createRef<HTMLInputElement>(),
  dobInput: createRef<HTMLInputElement>(),
  passwordInput: createRef<HTMLInputElement>(),
  institutionInput: createRef<HTMLInputElement>(),
  departmentInput: createRef<HTMLInputElement>(),
  levelInput: createRef<HTMLInputElement>()
};

const Memoize = createMemo();

const Signup = (props: SignupPropsState) => {
  const [passwordVisible, setPasswordVisible] = useState(Boolean);
  const [hideInstitutionsList, setHideInstitutionsList] = useState(Boolean);
  const [hideDepartmentsList, setHideDepartmentsList] = useState(Boolean);
  const [hideLevelsList, setHideLevelsList] = useState(Boolean);
  const { isAuthenticated } = props.auth;
  const handleInstitutionChange = useCallback((e: any) => {
    const { target } = e;

    e.target.dataset.uid = '';
    dispatch(getMatchingInstitutions(target.value)(dispatch));
    handleSignupInputChange(e);
    setHideInstitutionsList(!target.value || !navigator.onLine);
  }, []);
  const handleDepartmentChange = useCallback((e: any) => {
    const { target } = e;

    e.target.dataset.uid = '';
    dispatch(getMatchingDepartments(target.value)(dispatch));
    handleSignupInputChange(e);
    setHideDepartmentsList(!target.value || !navigator.onLine);
  }, []);
  const handleLevelChange = useCallback((e: any) => {
    const { target } = e;

    e.target.dataset.uid = '';
    dispatch(getMatchingLevels(target.value)(dispatch));
    handleSignupInputChange(e);
    setHideLevelsList(!target.value || !navigator.onLine);
  }, []);
  const inputAdorned = useMemo(() => {
    return {
      endAdornment: (
        <InputAdornment position='end'>
          <IconButton
            aria-label='toggle password visibility'
            onClick={() => setPasswordVisible(!passwordVisible)}>
            {passwordVisible ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      )
    };
  }, [passwordVisible]);

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
              <Memoize
                memoizedComponent={TextField}
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
                InputProps={inputAdorned}
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
              className='academic-info-input-wrapper'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={props.institution.err}
                variant='outlined'
                id='institution'
                label='Institution'
                size='medium'
                value={props.institution.value.keyword || ''}
                autoComplete='institution'
                inputRef={refs.institutionInput}
                helperText={props.institution.helperText}
                fullWidth
                onChange={handleInstitutionChange}
              />
              <ClickAwayListener
                onClickAway={() => setHideInstitutionsList(true)}>
                <List
                  className={`search-list custom-scroll-bar ${
                    props.institution.value.keyword &&
                    !props.institution.err &&
                    !hideInstitutionsList
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
                          setHideInstitutionsList(true);
                          dispatch(
                            validateInstitution({
                              value: {
                                keyword: institution.name,
                                uid: institution.id
                              }
                            })
                          );
                          refs.institutionInput.current.dataset.uid = institution.id;
                        }}>
                        {(() => {
                          const country = `<span class='theme-color-tertiary-lighter'>${institution.country}</span>`;
                          const keyword = props.institution.value.keyword;
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
            <Box
              component='div'
              marginY='0.25em'
              minWidth='100%'
              className='academic-info-input-wrapper'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={props.department.err}
                variant='outlined'
                disabled={props.institution.err || !props.institution.value.uid}
                id='department'
                label='Department'
                value={props.department.value.keyword || ''}
                size='medium'
                autoComplete='department'
                inputRef={refs.departmentInput}
                helperText={props.department.helperText}
                fullWidth
                onChange={handleDepartmentChange}
              />
              <ClickAwayListener
                onClickAway={() => setHideDepartmentsList(true)}>
                <List
                  className={`search-list custom-scroll-bar ${
                    props.department.value.keyword &&
                    !props.department.err &&
                    !hideDepartmentsList
                      ? 'open'
                      : 'close'
                  }`}
                  aria-label='departments list'>
                  {props.matchingDepartments?.data
                    ?.slice(0, 15)
                    .map((department: any, key: number) => (
                      <ListItem
                        button
                        divider
                        key={key}
                        onClick={() => {
                          setHideDepartmentsList(true);
                          dispatch(
                            validateDepartment({
                              value: {
                                keyword: department.name,
                                uid: department.id
                              }
                            })
                          );
                          refs.departmentInput.current.dataset.uid = department.id;
                        }}>
                        {(() => {
                          const highlighted = `${department.name.replace(
                            new RegExp(
                              `(${props.department.value.keyword})`,
                              'i'
                            ),
                            `<span class='theme-color-secondary-darker'>$1</span>`
                          )}`.replace(/<\/?script>/gi, '');

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
        </Grid>

        <Grid justify='space-between' container>
          <Grid item xs={12} sm={6} className='flex-basis-halved'>
            <Box
              component='div'
              marginY='0.25em'
              minWidth='100%'
              className='academic-info-input-wrapper'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={props.level.err}
                variant='outlined'
                disabled={props.department.err || !props.department.value.uid}
                id='level'
                label='Level (E.g. 100)'
                value={props.level.value.keyword || ''}
                size='medium'
                autoComplete='level'
                inputRef={refs.levelInput}
                helperText={props.level.helperText}
                fullWidth
                onChange={handleLevelChange}
              />
              <ClickAwayListener onClickAway={() => setHideLevelsList(true)}>
                <List
                  className={`search-list custom-scroll-bar ${
                    props.level.value.keyword &&
                    !props.level.err &&
                    !hideLevelsList
                      ? 'open'
                      : 'close'
                  }`}
                  aria-label='institutions list'>
                  {props.matchingLevels?.data
                    ?.slice(0, 15)
                    .map((level: any, key: number) => (
                      <ListItem
                        button
                        divider
                        key={key}
                        onClick={() => {
                          setHideLevelsList(true);
                          dispatch(
                            validateLevel({
                              value: {
                                keyword: level.name,
                                uid: level.id
                              }
                            })
                          );
                          refs.levelInput.current.dataset.uid = level.id;
                        }}>
                        {(() => {
                          const highlighted = `${level.name.replace(
                            new RegExp(`(${props.level.value.keyword})`, 'i'),
                            `<span class='theme-color-secondary-darker'>$1</span>`
                          )}`.replace(/<\/?script>/gi, '');

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

export function createMemo() {
  return React.memo((props: any) => {
    const Component = props.memoizedComponent;
    let _props = { ...props };

    if (!Component) {
      throw Error(
        "You're probably missing the 'memoizedComponent' prop for Memoize."
      );
    }

    delete _props.memoizedComponent;
    return <Component {..._props} />;
  });
}

const mapStateToProps = (state: any) => {
  return {
    firstname: state.firstname,
    lastname: state.lastname,
    username: state.username,
    email: state.email,
    dob: state.dob,
    password: state.password,
    institution: state.institution,
    department: state.department,
    level: state.level,
    matchingInstitutions: state.matchingInstitutions,
    matchingDepartments: state.matchingDepartments,
    matchingLevels: state.matchingLevels,
    signup: state.signup,
    auth: state.auth
  };
};

export default connect(mapStateToProps)(Signup);
