import { ChangeEvent } from 'react';

import * as actions from '../actions/validate';
import { getState, dispatch } from './utils';
import { refs as signupRefs } from '../components/Auth/Signup';
import { requestSignup } from '../actions';
import { SignupFormData } from '../constants';

export function handleSignupInputChange({
  target
}: ChangeEvent<HTMLInputElement>) {
  let { id, value } = target;
  let uid = target.dataset?.uid;

  switch (id) {
    case 'firstname':
      return dispatch(actions.validateFirstname({ value }));
    case 'lastname':
      return dispatch(actions.validateLastname({ value }));
    case 'username':
      return dispatch(actions.validateUsername({ value }));
    case 'email':
      return dispatch(actions.validateEmail({ value }));
    case 'dob':
      return dispatch(actions.validateDob({ value }));
    case 'password':
      return dispatch(actions.validatePassword({ value }));
    case 'institution':
      return dispatch(
        actions.validateInstitution({ value: { keyword: value, uid } })
      );
    case 'department':
      return dispatch(
        actions.validateDepartment({ value: { keyword: value, uid } })
      );
    case 'level':
      return dispatch(
        actions.validateLevel({ value: { keyword: value, uid } })
      );
  }
}

export function handleSignupRequest() {
  let signupFormValidated = true;
  const {
    institution: _institution,
    department: _department,
    level: _level,
    matchingInstitutions,
    matchingDepartments,
    matchingLevels
  } = getState();

  for (const key in signupRefs) {
    const event = {
      target: signupRefs[key].current
    } as ChangeEvent<HTMLInputElement>;
    const { target } = event;

    switch (target.id) {
      case 'institution':
        // event.target.dataset.uid = _institution.value?.uid;
        handleSignupInputChange(event);

        if (
          !_institution.value!.uid &&
          !!matchingInstitutions!.data![0] &&
          target.value
        ) {
          dispatch(
            actions.validateInstitution({
              err: true,
              helperText: 'You need to select an institution from the list.'
            })
          );
        } else
          dispatch(actions.getMatchingInstitutions(target.value)(dispatch));
        break;
      case 'department':
        // event.target.dataset.uid = _department.value?.uid;
        handleSignupInputChange(event);

        if (/^[a-z\s?]+$/i.test(target.value))
          if (
            !_department.value!.uid &&
            !!matchingDepartments!.data![0] &&
            target.value
          ) {
            dispatch(
              actions.validateDepartment({
                err: true,
                helperText: 'You need to select a department from the list.'
              })
            );
          } else
            dispatch(actions.getMatchingDepartments(target.value)(dispatch));
        break;
      case 'level':
        // event.target.dataset.uid = _level.value?.uid;
        handleSignupInputChange(event);

        if (/^[a-z0-9\s?]+$/i.test(target.value)) {
          if (
            !_level.value!.uid &&
            !!matchingLevels!.data![0] &&
            target.value
          ) {
            dispatch(
              actions.validateLevel({
                err: true,
                helperText: 'You need to select a level from the list.'
              })
            );
          } else dispatch(actions.getMatchingLevels(target.value)(dispatch));
        }
        break;
      default:
        handleSignupInputChange(event);
    }
  }

  const {
    firstname,
    lastname,
    username,
    email,
    dob,
    password,
    institution,
    department,
    level
  }: any = getState();

  if (
    firstname.err ||
    lastname.err ||
    username.err ||
    email.err ||
    dob.err ||
    password.err ||
    institution.err ||
    department.err ||
    level.err
  ) {
    signupFormValidated = false;
  }

  let formData: SignupFormData = {
    firstname: firstname.value,
    lastname: lastname.value,
    username: username.value,
    email: email.value,
    dob: dob.value,
    password: password.value,
    institution: institution.value.uid,
    department: department.value.uid,
    level: level.value.uid
  };

  if (signupFormValidated) {
    //dispatch signup user action here and signup user...
    dispatch(requestSignup({ ...formData })(dispatch));
  }
}
