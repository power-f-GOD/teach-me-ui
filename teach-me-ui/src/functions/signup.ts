import { ChangeEvent } from 'react';

import * as actions from '../actions/validate';
import { getState, dispatch } from './utils';
import { refs as signupRefs } from '../components/Auth/Signup';
import { requestSignup } from '../actions';
import { SignupFormData, SignupPropsState } from '../types';

export function handleSignupInputChange({
  target
}: ChangeEvent<HTMLInputElement>) {
  let { id, value } = target;

  switch (id) {
    case 'first_name':
      return dispatch(actions.validateFirstname({ value }));
    case 'last_name':
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
      let uid = target.dataset?.uid;

      return dispatch(
        actions.validateInstitution({ value: { keyword: value, uid: uid } })
      );
    case 'department':
      return dispatch(actions.validateDepartment({ value }));
    case 'level':
      return dispatch(actions.validateLevel({ value }));
  }
}

export function handleSignupRequest() {
  let signupFormValidated = true;
  const { institution: _institution, matchingInstitutions } = getState();

  for (const key in signupRefs) {
    const event = {
      target: signupRefs[key].current
    } as ChangeEvent<HTMLInputElement>;
    const { target } = event;

    handleSignupInputChange(event);

    switch (target.id) {
      case 'institution':
        if (
          !_institution.value!.uid &&
          !!matchingInstitutions!.data![0] &&
          target.value
        ) {
          dispatch(
            actions.validateInstitution({
              err: true,
              helperText: 'You need to select an institution from the dropdown.'
            })
          );
        } else
          dispatch(actions.getMatchingInstitutions(target.value)(dispatch));
        break;
      case 'department':
        if (/^[a-z\s?]+$/i.test(target.value))
          dispatch(actions.getMatchingDepartments(target.value)(dispatch));
        break;
      case 'level':
        if (/^[a-z0-9\s?]+$/i.test(target.value)) {
          dispatch(actions.getMatchingLevels(target.value)(dispatch));
        }
        break;
      default:
        handleSignupInputChange(event);
    }
  }

  const {
    first_name,
    last_name,
    username,
    email,
    dob,
    password,
    institution,
    department,
    level
  } = (getState() as unknown) as SignupPropsState;

  if (
    first_name.err ||
    last_name.err ||
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
    first_name: first_name.value as string,
    last_name: last_name.value as string,
    username: username.value as string,
    email: email.value as string,
    dob: dob.value as string,
    password: password.value as string,
    institution: institution.value!.uid as string,
    department: department.value as string,
    level: level.value as string
  };

  if (signupFormValidated) {
    //dispatch signup user action here and signup user...
    dispatch(requestSignup({ ...formData })(dispatch));
  }
}
