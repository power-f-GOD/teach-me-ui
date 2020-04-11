<<<<<<< HEAD
import * as actions from '../actions';
<<<<<<< HEAD
import { promisedDispatch, getState, dispatch } from './utils';
import { refs } from '../components/Signup';
=======
>>>>>>> 36e584fd
import { ChangeEvent } from 'react';

import * as actions from '../actions/validate';
import { promisedDispatch, getState, dispatch } from './utils';
import { refs as signupRefs } from '../components/Signup';
import { refs as signinRefs } from '../components/Signup';
import { requestSignup, signup } from '../actions';
import { SignupFormData } from '../constants';
=======
import { promisedDispatch, getState } from './utils';
import { refs } from '../components/Signup';
import { ChangeEvent } from 'react';
>>>>>>> Modify code base for signup validation et al.

export function handleSignupInputChange({ target }: ChangeEvent<HTMLInputElement>) {
  const { id, value } = target;

<<<<<<< HEAD
<<<<<<< HEAD
  //set status message to empty string on change of input in case status message is visible
  promisedDispatch(signupUser({ status: 'settled', statusMsg: ' ' }));

=======
>>>>>>> 36e584fd
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
<<<<<<< HEAD
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
=======
      return dispatch(actions.validatePassword({ value }));
>>>>>>> 36e584fd
  }
}

export function handleSignupSubmission() {
  let signupFormValidated = true;

  for (const key in signupRefs) {
    const event = {
<<<<<<< HEAD
<<<<<<< HEAD
      target: refs[key].current
=======
      target: refs[key].current,
>>>>>>> Modify code base for signup validation et al.
=======
      target: signupRefs[key].current
>>>>>>> 36e584fd
    } as ChangeEvent<HTMLInputElement>;

    handleSignupInputChange(event);
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
<<<<<<< HEAD
    promisedDispatch(requestSignup({ ...formData })(dispatch));
=======
  if (signupFormValidated) {
    //dispatch signup user action here and signup user...
    window.alert('Form inputs validated! Thank you!');
>>>>>>> Modify code base for signup validation et al.
=======
    dispatch(requestSignup({ ...formData })(dispatch));
>>>>>>> 36e584fd
  }
}
