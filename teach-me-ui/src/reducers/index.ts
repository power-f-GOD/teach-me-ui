import { combineReducers } from 'redux';

import * as validate from './validate';
import * as auth from './auth';
import * as misc from './misc';
import * as chat from './chat';
import * as modals from './modals';
import * as posts from './posts';
import * as search from './search';
import * as profile from './profile';

export default combineReducers({
  ...validate,
  ...auth,
  ...misc,
  ...chat,
  ...modals,
  ...posts,
  ...search,
  ...profile
});
