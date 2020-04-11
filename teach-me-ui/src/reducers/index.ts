import { combineReducers } from 'redux';

import * as validate from './validate';
import * as auth from './auth';
import * as misc from './misc';

export default combineReducers({ ...validate, ...auth, ...misc });
