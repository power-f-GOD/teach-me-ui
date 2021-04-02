/* eslint import/no-webpack-loader-syntax: off */

import React, {
  useState,
  useCallback,
  useMemo,
  createRef,
  ChangeEvent,
  useEffect
} from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import MomentUtils from '@date-io/moment';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

// import Worker from 'worker-loader!./worker.ts';

import createMemo from '../../Memo';
import { SignupPropsState } from '../../types';
import {
  handleSignupInputChange,
  handleSignupRequest
} from '../../functions/signup';
import { dispatch } from '../../functions';
import {
  getMatchingInstitutions,
  getMatchingDepartments,
  getMatchingLevels
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
  const {
    first_name,
    last_name,
    username,
    email,
    dob,
    password,
    institution,
    department,
    level,
    matchingInstitutions,
    matchingDepartments,
    matchingLevels,
    signup,
    auth
  } = props;
  const [passwordVisible, setPasswordVisible] = useState(Boolean);
  const [hideInstitutionsList, setHideInstitutionsList] = useState(Boolean);
  const [hideDepartmentsList, setHideDepartmentsList] = useState(Boolean);
  const [hideLevelsList, setHideLevelsList] = useState(Boolean);
  const { isAuthenticated } = auth;

  const handleInstitutionChange = useCallback(
    (e: any) => {
      const { target } = e;

      target.dataset.uid =
        institution.value!.keyword !== target.value.trim()
          ? ''
          : institution.value!.uid;
      handleSignupInputChange(e);
      dispatch(getMatchingInstitutions(target.value)(dispatch));
      setHideInstitutionsList(!target.value.trim() || !navigator.onLine);
    },
    [institution.value]
  );

  const handleDepartmentChange = useCallback(
    (e: any) => {
      const { target } = e;
      const inputIsValid = /^[a-z\s?]+$/i.test(target.value);

      e.target.dataset.uid =
        department.value !== target.value.trim() ? '' : department.value;

      handleSignupInputChange(e);
      setHideDepartmentsList(!target.value.trim() || !navigator.onLine);

      if (inputIsValid)
        dispatch(getMatchingDepartments(target.value)(dispatch));
    },
    [department.value]
  );

  const handleLevelChange = useCallback(
    (e: any) => {
      const { target } = e;
      const inputIsValid = /^[a-z0-9\s?]+$/i.test(target.value);

      e.target.dataset.uid =
        level.value !== target.value.trim() ? '' : level.value;
      handleSignupInputChange(e);
      setHideLevelsList(!target.value.trim() || !navigator.onLine);
      if (inputIsValid) dispatch(getMatchingLevels(target.value)(dispatch));
    },
    [level.value]
  );

  const capitalizeInput = useCallback(
    (e: any) => {
      const { id, value } = e.target;

      if (/first|last|department|level/.test(id) && value) {
        e.target.value = value
          .split(' ')
          .map((word: string) =>
            /^(in|of|and|on)$/i.test(word)
              ? word.toLowerCase()
              : word.toLowerCase().replace(/^\w|-\w/g, (a) => a.toUpperCase())
          )
          .join(' ');

        if (id === 'department') handleDepartmentChange(e);
        else if (id === 'level') handleLevelChange(e);
        else handleSignupInputChange(e);
      } else if (/email|username/.test(id) && value) {
        e.target.value = value.toLowerCase();
        handleSignupInputChange(e);
      }
    },
    [handleDepartmentChange, handleLevelChange]
  );

  const triggerSearch = useCallback(
    (e: any) => {
      if (!e.target.value.trim()) return;

      switch (e.target.id) {
        case 'institution':
          if (!institution.value!.uid) {
            handleInstitutionChange(e);
          } else setHideInstitutionsList(false);
          break;
        case 'department':
          if (!department.value) {
            handleDepartmentChange(e);
          } else setHideDepartmentsList(false);
          break;
        case 'level':
          if (!level.value) {
            handleLevelChange(e);
          } else setHideLevelsList(false);
      }
    },
    [
      institution.value,
      department.value,
      level.value,
      handleInstitutionChange,
      handleDepartmentChange,
      handleLevelChange
    ]
  );

  const inputProps = useMemo(() => {
    return {
      onKeyPress: (e: any) => {
        if (e.key === 'Enter') {
          e.target.blur();
        }
      },
      onBlur: capitalizeInput,
      onFocus: triggerSearch
    };
  }, [capitalizeInput, triggerSearch]);

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

  const matchingInstitutionsList = (
    <ClickAwayListener
      onClickAway={() =>
        document.activeElement?.id !== 'institution' &&
        setHideInstitutionsList(true)
      }>
      <List
        className={`search-list custom-scroll-bar ${
          institution.value?.keyword &&
          !institution.err &&
          !hideInstitutionsList
            ? 'open'
            : 'close'
        }`}
        aria-label='institutions list'>
        {matchingInstitutions?.data?.slice(0, 15).map((_institution, key) => (
          <ListItem
            button
            divider
            key={key}
            onClick={() => {
              const institutionInput = refs.institutionInput.current;
              const e = {
                target: institutionInput
              } as React.ChangeEvent<HTMLInputElement>;

              institutionInput.dataset.uid = _institution.id;
              institutionInput.value = _institution.name;
              handleSignupInputChange(e);
              setHideInstitutionsList(true);
            }}>
            {(() => {
              const country = `<span class='theme-tertiary-lighter'>${_institution.country}</span>`;
              const keyword = institution.value?.keyword!.trim();
              const highlighted = `${_institution.name.replace(
                new RegExp(`(${keyword})`, 'i'),
                `<span class='theme-secondary-lighter'>$1</span>`
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
  );

  const matchingDepartmentsList = (
    <ClickAwayListener
      onClickAway={() =>
        document.activeElement?.id !== 'department' &&
        setHideDepartmentsList(true)
      }>
      <List
        className={`search-list custom-scroll-bar ${
          department.value && !department.err && !hideDepartmentsList
            ? 'open'
            : 'close'
        }`}
        aria-label='departments list'>
        {matchingDepartments?.data
          ?.slice(0, 15)
          .map((_department: string, key: number) => (
            <ListItem
              button
              divider
              key={key}
              onClick={() => {
                const departmentInput = refs.departmentInput.current;
                const e = {
                  target: departmentInput
                } as React.ChangeEvent<HTMLInputElement>;

                setHideDepartmentsList(true);
                departmentInput.value = _department;
                handleSignupInputChange(e);
              }}>
              {(() => {
                const highlighted = `${_department
                  .trim()
                  .replace(
                    new RegExp(`(${department.value!.trim()})`, 'i'),
                    `<span class='theme-secondary-lighter'>$1</span>`
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
  );

  const matchingLevelsList = (
    <ClickAwayListener
      onClickAway={() =>
        document.activeElement?.id !== 'level' && setHideLevelsList(true)
      }>
      <List
        className={`search-list custom-scroll-bar ${
          level.value && !level.err && !hideLevelsList ? 'open' : 'close'
        }`}
        aria-label='institutions list'>
        {matchingLevels?.data
          ?.slice(0, 15)
          .map((_level: string, key: number) => (
            <ListItem
              button
              divider
              key={key}
              onClick={() => {
                const levelInput = refs.levelInput.current;
                const e = {
                  target: levelInput
                } as React.ChangeEvent<HTMLInputElement>;

                setHideLevelsList(true);
                levelInput.value = _level;
                handleSignupInputChange(e);
              }}>
              {(() => {
                const highlighted = `${_level
                  .trim()
                  .replace(
                    new RegExp(`(${level.value!.trim()})`, 'i'),
                    `<span class='theme-secondary-lighter'>$1</span>`
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
  );

  useEffect(() => () => window.scrollTo(0, 0), []);

  if (isAuthenticated) {
    return <Redirect to='/' />;
  }

  return (
    <Box
      width='40rem'
      className='auth-form-wrapper fade-in d-flex flex-column justify-content-center'>
      <Box
        component='h2'
        marginY='0.5em'
        fontSize='1.25rem'
        className='col px-0'
        fontWeight={900}>
        Basic info:
      </Box>

      <form
        noValidate
        autoComplete='on'
        onSubmit={(e: any) => e.preventDefault()}>
        <Row className='mx-0'>
          <Col xs={12} sm={6} className='pl-0'>
            <Box marginY='0.25em'>
              <Memoize
                memoizedComponent={TextField}
                error={first_name.err}
                required
                variant='outlined'
                id='first_name'
                label='First name'
                size='medium'
                autoComplete='given-name'
                inputRef={refs.firstnameInput}
                helperText={first_name.helperText}
                fullWidth
                onChange={handleSignupInputChange}
                inputProps={inputProps}
              />
            </Box>
          </Col>
          <Col xs={12} sm={6} className='pr-0'>
            <Box marginY='0.25em'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={last_name.err}
                variant='outlined'
                id='last_name'
                label='Last name'
                size='medium'
                autoComplete='family-name'
                inputRef={refs.lastnameInput}
                helperText={last_name.helperText}
                fullWidth
                onChange={handleSignupInputChange}
                inputProps={inputProps}
              />
            </Box>
          </Col>
        </Row>

        <Row className='mx-0'>
          <Col xs={12} sm={6} className='pl-0'>
            <Box component='div' marginY='0.25em' minWidth='100%'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={username.err}
                variant='outlined'
                id='username'
                label='Username'
                size='medium'
                autoComplete='nickname'
                inputRef={refs.usernameInput}
                helperText={username.helperText}
                fullWidth
                onChange={handleSignupInputChange}
                inputProps={inputProps}
              />
            </Box>
          </Col>
          <Col xs={12} sm={6} className='pr-0'>
            <Box component='div' marginY='0.25em' minWidth='100%'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={email.err}
                variant='outlined'
                id='email'
                label='Email'
                size='medium'
                type='email'
                autoComplete='username'
                inputRef={refs.emailInput}
                helperText={email.helperText}
                fullWidth
                onChange={handleSignupInputChange}
                inputProps={inputProps}
              />
            </Box>
          </Col>
        </Row>

        <Row className='mx-0'>
          <Col xs={12} sm={6} className='pl-0'>
            <Box component='div' marginY='0.25em' minWidth='100%'>
              <Memoize memoizedComponent={DatePicker} dob={dob} />
            </Box>
          </Col>
          <Col xs={12} sm={6} className='pr-0'>
            <Box component='div' marginY='0.25em' minWidth='100%'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={password.err}
                variant='outlined'
                id='password'
                label='Password'
                type={passwordVisible ? 'text' : 'password'}
                size='medium'
                autoComplete='new-password'
                inputRef={refs.passwordInput}
                helperText={password.helperText}
                fullWidth
                onChange={handleSignupInputChange}
                inputProps={inputProps}
                InputProps={inputAdorned}
              />
            </Box>
          </Col>
        </Row>

        <Box
          component='h2'
          marginY='0.5em'
          fontSize='1.25rem'
          fontWeight={900}
          className='col px-0'>
          Academic info:
        </Box>

        <Row className='mx-0'>
          <Col xs={12} sm={6} className='pl-0'>
            <Box
              component='div'
              marginY='0.25em'
              minWidth='100%'
              className='academic-info-input-wrapper'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={institution.err}
                variant='outlined'
                id='institution'
                label='Institution'
                size='medium'
                value={institution.value!.keyword || ''}
                className={institution.value!.uid ? 'input-set' : 'not-set'}
                autoComplete='institution'
                inputRef={refs.institutionInput}
                helperText={institution.helperText}
                fullWidth
                onChange={handleInstitutionChange}
                inputProps={inputProps}
              />
              {matchingInstitutions.status === 'pending' && (
                <LinearProgress color='primary' />
              )}
              {matchingInstitutionsList}
            </Box>
          </Col>
          <Col xs={12} sm={6} className='pr-0'>
            <Box
              component='div'
              marginY='0.25em'
              minWidth='100%'
              className='academic-info-input-wrapper'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={department.err}
                variant='outlined'
                // disabled={institution.err || !institution.value?.uid}
                id='department'
                label='Department'
                size='medium'
                value={department.value || ''}
                className={
                  department.value && institution.value!.uid
                    ? 'input-set'
                    : 'not-set'
                }
                autoComplete='department'
                inputRef={refs.departmentInput}
                helperText={department.helperText}
                fullWidth
                onChange={handleDepartmentChange}
                inputProps={inputProps}
              />
              {matchingDepartments.status === 'pending' && (
                <LinearProgress color='primary' />
              )}
              {matchingDepartmentsList}
            </Box>
          </Col>
        </Row>

        <Row className='mx-0'>
          <Col xs={12} sm={6} className='pl-0'>
            <Box
              component='div'
              marginY='0.25em'
              minWidth='100%'
              className='academic-info-input-wrapper'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={level.err}
                variant='outlined'
                // disabled={department.err || !department.value?.uid}
                id='level'
                label='Level (E.g. 100, Freshman)'
                size='medium'
                autoComplete='level'
                value={level.value || ''}
                className={
                  level.value && institution.value!.uid
                    ? 'input-set'
                    : 'not-set'
                }
                inputRef={refs.levelInput}
                helperText={level.helperText}
                fullWidth
                onChange={handleLevelChange}
                inputProps={inputProps}
              />
              {matchingLevels.status === 'pending' && (
                <LinearProgress color='primary' />
              )}
              {matchingLevelsList}
            </Box>
          </Col>
          <Col xs={12} sm={6} className='pr-0' key='button'>
            <Box component='div' marginY='0.25em' minWidth='100%'>
              <Memoize
                memoizedComponent={Button}
                variant='contained'
                size='large'
                disabled={signup.status === 'pending'}
                id='sign-up'
                className='major-button'
                type='submit'
                color='primary'
                fullWidth
                onClick={handleSignupRequest}>
                {signup.status === 'pending' ? (
                  <CircularProgress color='inherit' size={28} />
                ) : (
                  'SIGN UP'
                )}
              </Memoize>
            </Box>
          </Col>
        </Row>
      </form>

      <Box marginY='1em' className='text-center'>
        Have a an account? <Link to='/signin'>Sign in here!</Link>
      </Box>
    </Box>
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
        className='secondary'
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
    first_name: state.first_name,
    last_name: state.last_name,
    username: state.username,
    email: state.email,
    dob: state.dob,
    password: state.password,
    institution: state.institution,
    department: state.department,
    level: state.level,
    matchingInstitutions: state.matchingInstitutions,
    matchingDepartments: state.matchingDepartments,
    createDepartment: state.createDepartment,
    matchingLevels: state.matchingLevels,
    createLevel: state.createLevel,
    signup: state.signup,
    auth: state.auth
  };
};

export default connect(mapStateToProps)(Signup);
