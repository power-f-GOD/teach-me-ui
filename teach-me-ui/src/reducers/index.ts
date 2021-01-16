import { combineReducers } from 'redux';

import * as validate from './validate';
import * as auth from './auth';
import * as misc from './misc';
import * as chat from './chat';
import * as upload from './upload';
import * as modals from './modals';
import * as posts from './home';
import * as search from './search';
import * as profile from './profile';
import * as question from './question';
import * as colleague from './colleague';
import * as notifications from './notifications';
import * as editProfile from './profile.edit';

import { SIGNOUT_USER } from '../constants';
import { ReduxAction } from '../types';

export default function reducers(state: any, action: ReduxAction) {
  if (action.type === SIGNOUT_USER) {
    state = undefined;
  }

  return combineReducers({
    ...validate,
    ...auth,
    ...misc,
    ...chat,
    ...upload,
    ...modals,
    ...posts,
    ...search,
    ...profile,
    ...question,
    ...colleague,
    ...editProfile,
    ...notifications
  })(state, action);
}
