import React, {
  useState, 
  useRef,
  ChangeEvent
} from 'react';

import { connect } from 'react-redux';

import { 
  sendFilesToServer,
  getUploads,
  uploads
} from '../../../../actions';