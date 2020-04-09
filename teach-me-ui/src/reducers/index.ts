import { combineReducers } from 'redux';

import * as validateInputs from './validate';
import * as authenticate from './authenticate';

export default combineReducers({ ...validateInputs, ...authenticate });
