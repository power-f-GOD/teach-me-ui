import { combineReducers } from 'redux';

import * as validateInputs from './validate';

export default combineReducers({ ...validateInputs });
