import { ChangeEvent } from 'react';

import * as actions from '../actions/validate';
import { getState, dispatch } from './utils';
import { refs as editProfileRefs } from '../components/modals/Profile.edit';
import { 
  updateProfileRequest,
  updateAcademicData,
  updateEmail,
  updateUsername,
  updateUserData
} from '../actions';


export const resetEditProfileState = () => {
  dispatch(updateAcademicData({status: 'settled'}));
  dispatch(updateEmail({status: 'settled'}));
  dispatch(updateUsername({status: 'settled'}));
  dispatch(updateUserData({status: 'settled'}));
}

export function handleEditProfileInputChange({
  target
}: ChangeEvent<HTMLInputElement>) {

  let { value, id } = target;
  

  switch (id) {
    case 'firstname':
      return dispatch(actions.validateFirstname({ value }));
    case 'lastname':
      return dispatch(actions.validateLastname({ value }));
    case 'username':
      return dispatch(actions.validateUsername({ value }));
    case 'bio':
      return dispatch(actions.validateBio({ value }));
    case 'email':
      return dispatch(actions.validateEmail({ value }));
    case 'dob':
      return dispatch(actions.validateDob({ value }));
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

export function handleEditProfileRequest() {
  let editProfileFormValidated = true;

  for (const key in editProfileRefs) {
    const event = {
      target: editProfileRefs[key].current
    } as ChangeEvent<HTMLInputElement>;
    const { target } = event;

    handleEditProfileInputChange(event);

    switch (target.id) {
      case 'institution':
          dispatch(actions.getMatchingInstitutions(target.value)(dispatch));
        break;
      case 'department':
        if (/^[a-z\s?]+$/i.test(target.value))
          dispatch(actions.getMatchingDepartments(target.value, true)(dispatch));
        break;
      case 'level':
        if (/^[a-z0-9\s?]+$/i.test(target.value)) {
          dispatch(actions.getMatchingLevels(target.value, true)(dispatch));
        }
        break;
      default:
        handleEditProfileInputChange(event);
    }
  }

  const {
    firstname,
    lastname,
    username,
    email,
    dob,
    institution,
    department,
    level,
    bio
  } = (getState() as unknown) as any;

  if (
    firstname.err ||
    lastname.err ||
    username.err ||
    email.err ||
    dob.err ||
    institution.err ||
    department.err ||
    level.err || 
    bio.err
  ) {
    editProfileFormValidated = false;
  }

  let formData: any = {
    firstname: firstname.value as string,
    lastname: lastname.value as string,
    username: username.value as string,
    email: email.value as string,
    dob: dob.value as string,
    institution: institution.value!.uid as string,
    department: department.value as string,
    level: level.value as string,
    bio: bio.value as string
  };

  if (editProfileFormValidated) {
    dispatch(updateProfileRequest({ ...formData })(dispatch));
  }
}
