import React, { useState } from 'react';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';

import { promisedDispatch } from '../../functions/utils';
import { displaySnackbar } from '../../actions/misc';
import { userDeviceIsMobile } from '../../index';

const SnackBar = (props: any) => {
  const { snackbar } = props;
  const { open, message, severity, autoHide, timeout: _timeout } = snackbar;
  const [closed, setClosed] = useState<boolean>(false);
  let timeout: any;

  const handleClose = (_event?: any, reason?: string) => {
    clearTimeout(timeout);

    if (reason === 'clickaway' && !autoHide) return;

    setClosed(true);
    promisedDispatch(displaySnackbar({ open: false })).then(() => {
      timeout = setTimeout(() => setClosed(false), 500);
    });
  };

  return (
    <Slide
      direction={closed ? 'right' : 'up'}
      in={open && !closed}
      mountOnEnter
      unmountOnExit
      timeout={userDeviceIsMobile ? (closed ? 225 : 275) : closed ? 325 : 375}>
      <Snackbar
        open
        onClose={handleClose}
        onEntered={() => setClosed(false)}
        TransitionComponent={Fade}
        autoHideDuration={_timeout ? _timeout : autoHide ? 4000 : null}
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
