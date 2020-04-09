import * as actions from '../actions';
<<<<<<< HEAD
import { promisedDispatch, getState, dispatch } from './utils';
import { refs } from '../components/Signup';
import { ChangeEvent } from 'react';
import { requestSignup, signupUser } from '../actions';
import { SignupFormData } from '../constants';
=======
import { promisedDispatch, getState } from './utils';
import { refs } from '../components/Signup';
import { ChangeEvent } from 'react';
>>>>>>> Modify code base for signup validation et al.

export function handleInputChange({ target }: ChangeEvent<HTMLInputElement>) {
  const { id, value } = target;

<<<<<<< HEAD
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
=======
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
>>>>>>> Modify code base for signup validation et al.
  }
}

export function handleFormSubmission() {
  let signupFormValidated = true;

  for (const key in refs) {
    const event = {
<<<<<<< HEAD
      target: refs[key].current
=======
      target: refs[key].current,
>>>>>>> Modify code base for signup validation et al.
    } as ChangeEvent<HTMLInputElement>;

    handleInputChange(event);
  }

<<<<<<< HEAD
  let { firstname, lastname, username, email, password }: any = getState();
=======
  let { firstname, lastname, username, email, password } = getState();
>>>>>>> Modify code base for signup validation et al.

  if (
    firstname.err ||
    lastname.err ||
    username.err ||
    email.err ||
    password.err
  ) {
    signupFormValidated = false;
  }

<<<<<<< HEAD
  let formData: SignupFormData = {
    firstname: firstname.value,
    lastname: lastname.value,
    username: username.value,
    email: email.value,
    password: password.value
  };

  if (signupFormValidated) {
    //dispatch signup user action here and signup user...
    promisedDispatch(requestSignup({ ...formData })(dispatch));
=======
  if (signupFormValidated) {
    //dispatch signup user action here and signup user...
    window.alert('Form inputs validated! Thank you!');
>>>>>>> Modify code base for signup validation et al.
  }
}
