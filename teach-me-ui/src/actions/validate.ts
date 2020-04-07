import {
  FIRSTNAME_VALIDATE,
  LASTNAME_VALIDATE,
  USERNAME_VALIDATE,
  EMAIL_VALIDATE,
  PASSWORD_VALIDATE,
  ReduxAction,
} from '../constants';

export const requestValidate = (
  targetId: string,
  value: string = ''
): ReduxAction => {
  const idPattern = new RegExp(targetId, 'i');
  const action: ReduxAction = {
    type: '',
    newState: {},
  };

  if (idPattern.test(FIRSTNAME_VALIDATE)) {
    let firstnameErr = !value || /\d+|\W+|_/.test(value);
    let firstnameHelperText = firstnameErr
      ? !value
        ? 'Firstname is required.'
        : "Ok. That can't be your firstname."
      : ' ';

    action.type = FIRSTNAME_VALIDATE;
    action.newState = {
      firstname: value,
      firstnameErr,
      firstnameHelperText
    };
  } else if (idPattern.test(LASTNAME_VALIDATE)) {
    let lastnameErr = !value || /\d+|\W+|_/.test(value);
    let lastnameHelperText = lastnameErr
      ? !value
        ? 'Lastname is required.'
        : "Doesn't look like a lastname."
      : ' ';

    action.type = LASTNAME_VALIDATE;
    action.newState = {
      lastname: value,
      lastnameErr,
      lastnameHelperText
    };
  } else if (idPattern.test(USERNAME_VALIDATE)) {
    let usernameErr = false;
    let usernameHelperText = ' ';

    if (/\d+|\W+/.test(value) || !value) {
      usernameErr = true;
      usernameHelperText =
        'Username not accepted. Use letters (and underscores) only';
    }

    usernameHelperText = !value ? 'Username is required.' : usernameHelperText;

    action.type = USERNAME_VALIDATE;
    action.newState = {
      username: value,
      usernameErr,
      usernameHelperText
    };
  } else if (idPattern.test(EMAIL_VALIDATE)) {
    let emailErr = false;
    let emailHelperText = ' ';

    if (!/^\w+[\w\d.]*[\w\d]+@\w+\.[\w\d.]+[\w\d]$/.test(value) || !value) {
      emailErr = true;
      emailHelperText = "Hm. That doesn't seem like a valid email.";
    }

    emailHelperText = !value ? 'Email is required.' : emailHelperText;

    action.type = EMAIL_VALIDATE;
    action.newState = {
      email: value,
      emailErr,
      emailHelperText
    };
  } else if (idPattern.test(PASSWORD_VALIDATE)) {
    let passwordErr = false;
    let passwordHelperText = ' ';

    if (value.length < 8 || !value) {
      passwordErr = true;
      passwordHelperText = 'Password should not be less than 8 characters.';
    } else if (/^[A-Z]$|^[a-z]+$|^[0-9]+$/.test(value)) {
      passwordErr = true;
      passwordHelperText =
        'Password is weak. Consider combining alphanumerics.';
    }

    passwordHelperText = !value ? 'Password is required.' : passwordHelperText;

    action.type = PASSWORD_VALIDATE;
    action.newState = {
      password: value,
      passwordErr,
      passwordHelperText
    };
  }

  return action;
};
