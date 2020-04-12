import { ChangeEvent } from 'react';

import * as actions from '../actions/validate';
import { getState, dispatch } from './utils';
import { refs as signupRefs } from '../components/Signup';
import { requestSignup } from '../actions';
import { SignupFormData } from '../constants';

export function handleSignupInputChange({ target }: ChangeEvent<HTMLInputElement>) {
  const { id, value } = target;

  switch (id) {
    case 'firstname':
      return dispatch(actions.validateFirstname({ value }));
    case 'lastname':
      return dispatch(actions.validateLastname({ value }));
    case 'username':
      return dispatch(actions.validateUsername({ value }));
    case 'email':
      return dispatch(actions.validateEmail({ value }));
    case 'password':
      return dispatch(actions.validatePassword({ value }));
  }
}

export function handleSignupRequest() {
  let signupFormValidated = true;

  for (const key in signupRefs) {
    const event = {
      target: signupRefs[key].current
    } as ChangeEvent<HTMLInputElement>;

    handleSignupInputChange(event);
  }

  let { firstname, lastname, username, email, password }: any = getState();

  if (
    firstname.err ||
    lastname.err ||
    username.err ||
    email.err ||
    password.err
  ) {
    signupFormValidated = false;
  }

  let formData: SignupFormData = {
    firstname: firstname.value,
    lastname: lastname.value,
    username: username.value,
    email: email.value,
    password: password.value
  };

  if (signupFormValidated) {
    //dispatch signup user action here and signup user...
    dispatch(requestSignup({ ...formData })(dispatch));
  }
}
