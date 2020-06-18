import { combineReducers } from 'redux';

import * as validate from './validate';
import * as auth from './auth';
import * as misc from './misc';
import * as chat from './chat';
import * as modals from './modals';

export default combineReducers({
  ...validate,
  ...auth,
  ...misc,
  ...chat,
  ...modals
});
