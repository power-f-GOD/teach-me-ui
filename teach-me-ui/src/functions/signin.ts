import { ChangeEvent } from 'react';

import { refs as signinRefs } from '../components/Signin';
import { getState, dispatch } from './utils';
import { SigninFormData } from '../constants';
import { validateSigninId, validateSigninPassword, requestSignin } from '../actions';

export function handleSigninInputChange({
  target
}: ChangeEvent<HTMLInputElement>) {
  const { id, value } = target;

  switch (id) {
    case 'signin-id':
      return dispatch(validateSigninId({ value }));
    case 'signin-password':
      return dispatch(validateSigninPassword({ value }));
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

  let { signinId, signinPassword }: any = getState();

  if (signinId.err || signinPassword.err) {
    signinFormValidated = false;
  }

  let formData: SigninFormData = {
    email: signinId.value,
    password: signinPassword.value
  };

  if (signinFormValidated) {
    //dispatch signup user action here and signup user...
    dispatch(requestSignin({ ...formData })(dispatch));
  }
}
