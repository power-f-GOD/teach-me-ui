import { ChangeEvent } from 'react';

import { refs as signinRefs } from '../components/Auth/Signin';
import { getState, dispatch } from './utils';
import { SigninFormData } from '../constants';
import {
  validateSigninId,
  validateSigninPassword,
  requestSignin,
  validatePersistSignIn
} from '../actions';

export function handleSigninInputChange({
  target
}: ChangeEvent<HTMLInputElement>) {
  const { id, value, checked } = target;

  switch (id) {
    case 'signin-id':
      return dispatch(validateSigninId({ value }));
    case 'signin-password':
      return dispatch(validateSigninPassword({ value }));
    case 'persist-signin':
      return dispatch(validatePersistSignIn({ value: checked }));
  }
}

export function handleSigninRequest() {
  let signinFormValidated = true;

  for (const key in signinRefs) {
    const event = {
      target: signinRefs[key].current
    } as ChangeEvent<HTMLInputElement>;

    handleSigninInputChange(event);
  }

  let { signinId, signinPassword, persistSignIn }: any = getState();

  if (signinId.err || signinPassword.err) {
    signinFormValidated = false;
  }

  let formData: SigninFormData = {
    id: signinId.value,
    password: signinPassword.value,
    persistSignIn: persistSignIn.value
  };

  if (signinFormValidated) {
    //dispatch signin user action here and signup user...
    dispatch(requestSignin({ ...formData })(dispatch));
  }
}
