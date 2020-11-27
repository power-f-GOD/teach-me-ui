/* eslint import/no-webpack-loader-syntax: off */

import React, {
  useState,
  useCallback,
  useMemo,
  ChangeEvent,
  useEffect,
  createRef
} from 'react';
import { connect } from 'react-redux';

import MomentUtils from '@date-io/moment';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
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
import {
  handleEditProfileInputChange,
  handleEditProfileRequest,
  resetEditProfileState
} from '../../functions/profile.edit';
import { dispatch, displayModal } from '../../functions';
import {
  matchingDepartments,
  matchingInstitutions,
  matchingLevels,
  getMatchingInstitutions,
  getMatchingDepartments,
  getMatchingLevels, 
  getUserDetailsRequest,
  getUserDetails
} from '../../actions';


export const refs: any = {
  firstnameInput: createRef<HTMLInputElement>(),
  lastnameInput: createRef<HTMLInputElement>(),
  usernameInput: createRef<HTMLInputElement>(),
  emailInput: createRef<HTMLInputElement>(),
  dobInput: createRef<HTMLInputElement>(),
  institutionInput: createRef<HTMLInputElement>(),
  departmentInput: createRef<HTMLInputElement>(),
  levelInput: createRef<HTMLInputElement>(),
  bioInput: createRef<HTMLInputElement>()
};

const Memoize = createMemo();


const EditProfile = (props: any) => {
  const {
    bio,
    firstname,
    lastname,
    username,
    email,
    dob,
    institution,
    department,
    level,
    matchingInstitutionsProp,
    matchingDepartmentsProp,
    matchingLevelsProp,
    userData,
    updateAcademicData,
    updateUserData,
    updateEmail,
    updateUsername,
    getUserDetailsProp
  } = props;

  const removeModal = () => {
    displayModal(false, true);
  }
  
  const closeModal = (e: any) => {
    if (String(window.location.hash)  === '') removeModal();
  }
  
  window.onhashchange = closeModal;

  if (updateAcademicData.status === 'fulfilled'
      && updateUserData.status === 'fulfilled'
      && updateEmail.status === 'fulfilled'
      && updateUsername.status === 'fulfilled'
      && updateAcademicData.err === false
      && updateUserData.err === false
      && updateEmail.err === false
      && updateUsername.err === false
  ) {
    resetEditProfileState();
    dispatch(getUserDetailsRequest()(dispatch));
  }

  if (getUserDetailsProp.status === 'fulfilled') {
    window.history.back();
    displayModal(false);
    dispatch(getUserDetails({status: 'settled', data: []}));
    dispatch(matchingDepartments({ status: 'settled', data: []}));
    dispatch(matchingInstitutions({ status: 'settled', data: []}));
    dispatch(matchingLevels({ status: 'settled', data: []}));
  }

  const [hideInstitutionsList, setHideInstitutionsList] = useState(Boolean);
  const [hideDepartmentsList, setHideDepartmentsList] = useState(Boolean);
  const [hideLevelsList, setHideLevelsList] = useState(Boolean);
  const [firstnameValue, setFirstnameValue] = useState(`${userData.first_name}`)
  const [lastnameValue, setLastnameValue] = useState(`${userData.last_name}`)
  const [usernameValue, setusernameValue] = useState(`${userData.username}`)
  const [emailValue, setEmailValue] = useState(`${userData.email}`)
  const [dateOfBirthValue, setDateOfBirthValue] = useState(/*`${userData.date_of_birth}`*/new Date())
  const [institutionValue, setInstitutionValue] = useState(`${userData.institution}`)
  const [departmentValue, setDepartmentValue] = useState(`${userData.department}`)
  const [levelValue, setLevelValue] = useState(`${userData.level}`)
  const [bioValue, setBioValue] = useState(`${userData.bio ? userData.bio : 'Hey there, I use Kanyimuta'}`)

  const handleInstitutionChange = useCallback(
    (e: any) => {
      const { target } = e;

      target.dataset.uid =
        institution.value!.keyword !== target.value.trim()
          ? ''
          : institution.value!.uid;
      handleEditProfileInputChange(e);
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

      handleEditProfileInputChange(e);
      setHideDepartmentsList(!target.value.trim() || !navigator.onLine);

      if (inputIsValid)
        dispatch(getMatchingDepartments(target.value, true)(dispatch));
    },
    [department.value]
  );

  const handleLevelChange = useCallback(
    (e: any) => {
      const { target } = e;
      const inputIsValid = /^[a-z0-9\s?]+$/i.test(target.value);

      e.target.dataset.uid =
        level.value !== target.value.trim() ? '' : level.value;
      handleEditProfileInputChange(e);
      setHideLevelsList(!target.value.trim() || !navigator.onLine);
      if (inputIsValid) dispatch(getMatchingLevels(target.value, true)(dispatch));
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
              : word[0].toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(' ');

        if (id === 'department') handleDepartmentChange(e);
        else if (id === 'level') handleLevelChange(e);
        else handleEditProfileInputChange(e);
      } else if (/email|username/.test(id) && value) {
        e.target.value = value.toLowerCase();
        handleEditProfileInputChange(e);
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
        {matchingInstitutionsProp?.data?.slice(0, 15).map((_institution: any, key: number) => (
          <ListItem
            button
            divider
            key={key}
            onClick={() => {
              const institutionInput = refs.institutionInput.current;
              const e = {
                target: institutionInput
              } as React.ChangeEvent<HTMLInputElement>;

              institutionInput.dataset.uid = _institution._id;
              institutionInput.value = _institution.name;
              handleEditProfileInputChange(e);
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
        {matchingDepartmentsProp?.data
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
                handleEditProfileInputChange(e);
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
        {matchingLevelsProp?.data
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
                handleEditProfileInputChange(e);
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

  setTimeout(() => {
    window.location.hash = 'modal';
  }, 0);

  return (
    <Box 
    width='45rem'
    className='auth-form-wrapper fade-in d-flex flex-column justify-content-center edit'>
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
          <Col xs={12} sm={6} className='pl-0 shift2'>
            <Box marginY='0.25em'>
              <Memoize
                memoizedComponent={TextField}
                error={firstname.err}
                required
                variant='outlined'
                id='firstname'
                label='First name'
                size='medium'
                autoComplete='given-name'
                inputRef={refs.firstnameInput}
                helperText={firstname.helperText}
                fullWidth
                onChange={(e: any) => {
                  setFirstnameValue(e.target.value);
                  handleEditProfileInputChange(e);
                }}
                inputProps={inputProps}
                value={firstnameValue}
              />
            </Box>
          </Col>
          <Col xs={12} sm={6} className='pr-0 shift'>
            <Box marginY='0.25em'>
              <Memoize
                memoizedComponent={TextField}
                required
                error={lastname.err}
                variant='outlined'
                id='lastname'
                label='Last name'
                size='medium'
                autoComplete='family-name'
                inputRef={refs.lastnameInput}
                helperText={lastname.helperText}
                fullWidth
                value={lastnameValue}
                onChange={(e: any) => {
                  setLastnameValue(e.target.value);
                  handleEditProfileInputChange(e);
                }}
                inputProps={inputProps}
              />
            </Box>
          </Col>
        </Row>

        <Row className='mx-0'>
          <Col xs={12} sm={6} className='pl-0 shift2'>
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
                value={usernameValue}
                onChange={(e: any) => {
                  setusernameValue(e.target.value);
                  handleEditProfileInputChange(e);
                }}
                inputProps={inputProps}
              />
            </Box>
          </Col>
          <Col xs={12} sm={6} className='pr-0 shift'>
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
                value={emailValue}
                onChange={(e: any) => {
                  setEmailValue(e.target.value);
                  handleEditProfileInputChange(e);
                }}
                inputProps={inputProps}
              />
            </Box>
          </Col>
        </Row>

        <Row className='mx-0'>
          <Col xs={12} sm={6} className='pl-0 shift2'>
            <Box component='div' marginY='0.25em' minWidth='100%'>
              <Memoize 
                memoizedComponent={DatePicker} 
                dob={dob}
                value={dateOfBirthValue}
                onChange={(e: any) => {
                  setDateOfBirthValue(e.target.value);
                }} 
              />
            </Box>
          </Col>
          <Col xs={12} sm={6} className='pr-0 shift'>
            <Box component='div' marginY='0.25em' minWidth='100%'>
              <Memoize
                error={bio.err}
                helperText={bio.helperText}
                memoizedComponent={TextField}
                variant='outlined'
                id='bio'
                label='Bio'
                size='medium'
                type='bio'
                inputRef={refs.bioInput}
                fullWidth
                value={bioValue}
                onChange={(e: any) => {
                  setBioValue(e.target.value);
                  handleEditProfileInputChange(e);
                }}
                inputProps={inputProps}
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
          <Col xs={12} sm={6} className='pl-0 shift2'>
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
                disabled
                // value={institution.value!.keyword || ''}
                className={institution.value!.uid ? 'input-set' : 'not-set'}
                autoComplete='institution'
                inputRef={refs.institutionInput}
                helperText={institution.helperText}
                fullWidth
                value={institutionValue.split(',')[0]}
                onChange={(e: any) => {
                  setInstitutionValue(e.target.value)
                  handleInstitutionChange(e);
                }}
                inputProps={inputProps}
              />
              {matchingInstitutionsProp.status === 'pending' && (
                <LinearProgress color='primary' />
              )}
              {matchingInstitutionsList}
            </Box>
          </Col>
          <Col xs={12} sm={6} className='pr-0 shift'>
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
                // value={department.value || ''}
                value={departmentValue}
                className={
                  department.value && institution.value!.uid
                    ? 'input-set'
                    : 'not-set'
                }
                autoComplete='department'
                inputRef={refs.departmentInput}
                helperText={department.helperText}
                fullWidth
                onChange={(e: any) => {
                  setDepartmentValue(e.target.value);
                  handleDepartmentChange(e);
                }}
                inputProps={inputProps}
              />
              {matchingDepartmentsProp.status === 'pending' && (
                <LinearProgress color='primary' />
              )}
              {matchingDepartmentsList}
            </Box>
          </Col>
        </Row>

        <Row className='mx-0'>
          <Col xs={12} sm={6} className='pl-0 shift2'>
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
                // value={level.value || ''}
                value={levelValue}
                className={
                  level.value && institution.value!.uid
                    ? 'input-set'
                    : 'not-set'
                }
                inputRef={refs.levelInput}
                helperText={level.helperText}
                fullWidth
                onChange={(e: any) => {
                  setLevelValue(e.target.value);
                  handleLevelChange(e);
                }}
                inputProps={inputProps}
              />
              {matchingLevelsProp.status === 'pending' && (
                <LinearProgress color='primary' />
              )}
              {matchingLevelsList}
            </Box>
          </Col>
          <Col xs={12} sm={6} className='pr-0 shift' key='button'>
            <Box component='div' marginY='0.25em' minWidth='100%'>
              <Memoize
                memoizedComponent={Button}
                variant='contained'
                size='large'
                disabled={
                  updateAcademicData.status === 'pending'
                  || updateUserData.status === 'pending'
                  || updateEmail.status === 'pending'
                  || updateUsername.status === 'pending'
                }
                id='sign-up'
                className='major-button'
                type='submit'
                color='primary'
                fullWidth
                onClick={handleEditProfileRequest}>
                {updateAcademicData.status === 'pending'
                  || updateUserData.status === 'pending'
                  || updateEmail.status === 'pending'
                  || updateUsername.status === 'pending' ? (
                  <CircularProgress color='inherit' size={28} />
                ) : (
                  'SAVE EDIT'
                )}
              </Memoize>
            </Box>
          </Col>
        </Row>
      </form>
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

    handleEditProfileInputChange(event);
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
    bio: state.bio,
    userData: state.userData,
    firstname: state.firstname,
    lastname: state.lastname,
    username: state.username,
    email: state.email,
    dob: state.dob,
    password: state.password,
    institution: state.institution,
    department: state.department,
    level: state.level,
    matchingInstitutionsProp: state.matchingInstitutions,
    matchingDepartmentsProp: state.matchingDepartments,
    createDepartment: state.createDepartment,
    matchingLevelsProp: state.matchingLevels,
    createLevel: state.createLevel,
    updateEmail: state.updateEmail,
    updateUsername: state.updateUsername,
    updateAcademicData: state.updateAcademicData,
    updateUserData: state.updateUserData,
    getUserDetailsProp: state.getUserDetails
  };
};

export default connect(mapStateToProps)(EditProfile);
