import React, { useState } from 'react';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';

import { promisedDispatch } from '../functions';
import { displaySnackbar } from '../actions';

const SnackBar = (props: any) => {
  const { snackbar } = props;
  const { open, message, severity, autoHide } = snackbar;
  const [closed = true, setClosed] = useState(Boolean);
  let timeout: any;

  const handleClose = () => {
    clearTimeout(timeout);
    setClosed(true);
    promisedDispatch(displaySnackbar({ open: false })).then(() => {
      timeout = setTimeout(() => setClosed(false), 400);
    });
  };

  return (
    <Slide
      direction={closed ? 'right' : 'up'}
      in={open && !closed}
      mountOnEnter
      unmountOnExit
      timeout={closed ? 325 : 375}>
      <Snackbar
        open
        onClose={handleClose}
        onEntered={() => setClosed(false)}
        TransitionComponent={Fade}
        autoHideDuration={autoHide ? 5000 : null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}>
        <MuiAlert
          elevation={6}
          variant='filled'
          severity={severity}
          onClose={handleClose}>
          {message}
        </MuiAlert>
      </Snackbar>
    </Slide>
  );
};

export default SnackBar;
