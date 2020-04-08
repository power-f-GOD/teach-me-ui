import { requestValidate } from '../actions/validate';
import { promisedDispatch } from './';
import { refs } from '../components/Signup';

export function handleInputChange({ target }: any) {
  promisedDispatch(requestValidate(target.id, target.value.trim()));
}

export function handleFormSubmission() {
  let signupFormValidated = true;
  let pendingValidations = [];

  for (const key in refs) {
    const { id, value } = refs[key].current;

    pendingValidations.push(promisedDispatch(requestValidate(id, value)));
  }

  Promise.all([...pendingValidations]).then((settledValidations: any) => {
    for (let validation of settledValidations) {
      let {
        firstnameErr,
        lastnameErr,
        usernameErr,
        emailErr,
        passwordErr,
      } = validation.newState;
      if (
        firstnameErr ||
        lastnameErr ||
        usernameErr ||
        emailErr ||
        passwordErr
      ) {
        signupFormValidated = false;
      }
    }

    if (signupFormValidated) {
      //dispatch signup user action here and signup user...
      window.alert('Form inputs validated! Thank you!');
    }
  });
}
