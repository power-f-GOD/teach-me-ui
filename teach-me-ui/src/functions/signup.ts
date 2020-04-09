import * as actions from '../actions';
import { promisedDispatch, getState } from './utils';
import { refs } from '../components/Signup';
import { ChangeEvent } from 'react';

export function handleInputChange({ target }: ChangeEvent<HTMLInputElement>) {
  const { id, value } = target;

  switch (id) {
    case 'firstname':
      return promisedDispatch(actions.validateFirstname(value));
    case 'lastname':
      return promisedDispatch(actions.validateLastname(value));
    case 'username':
      return promisedDispatch(actions.validateUsername(value));
    case 'email':
      return promisedDispatch(actions.validateEmail(value));
    case 'password':
      return promisedDispatch(actions.validatePassword(value));
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

  if (signupFormValidated) {
    //dispatch signup user action here and signup user...
    window.alert('Form inputs validated! Thank you!');
  }
}
