import * as actions from '../actions';
import { promisedDispatch, getState, dispatch } from './utils';
import { refs } from '../components/Signup';
import { ChangeEvent } from 'react';
import { requestSignup, signupUser } from '../actions';
import { SignupFormData } from '../constants';

export function handleInputChange({ target }: ChangeEvent<HTMLInputElement>) {
  const { id, value } = target;

  //set status message to empty string on change of input in case status message is visible
  promisedDispatch(signupUser({ status: 'settled', statusMsg: ' ' }));

  switch (id) {
    case 'firstname':
      return promisedDispatch(actions.validateFirstname({ value }));
    case 'lastname':
      return promisedDispatch(actions.validateLastname({ value }));
    case 'username':
      return promisedDispatch(actions.validateUsername({ value }));
    case 'email':
      return promisedDispatch(actions.validateEmail({ value }));
    case 'password':
      return promisedDispatch(actions.validatePassword({ value }));
  }
}

export function handleFormSubmission() {
  let signupFormValidated = true;

  for (const key in refs) {
    const event = {
      target: refs[key].current,
    } as ChangeEvent<HTMLInputElement>;

    handleInputChange(event);
  }

  let { firstname, lastname, username, email, password } = getState();

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
    password: password.value,
  };

  if (signupFormValidated) {
    //dispatch signup user action here and signup user...
    promisedDispatch(requestSignup({ ...formData })(dispatch));
  }
}
