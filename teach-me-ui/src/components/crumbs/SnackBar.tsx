import React, { useState } from 'react';
import { connect } from 'react-redux';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';

import { promisedDispatch } from '../../utils';
import { displaySnackbar } from '../../actions/misc';
import { SnackbarState } from '../../types';

const SnackBar = (props: { snackbar: SnackbarState; windowWidth: number }) => {
  const { snackbar, windowWidth } = props;
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
      direction={closed ? (windowWidth < 576 ? 'up' : 'right') : 'up'}
      in={open && !closed}
      mountOnEnter
      unmountOnExit
      timeout={windowWidth < 576 ? (closed ? 200 : 250) : closed ? 300 : 350}>
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

export default connect(
  (state: { snackbar: SnackbarState; windowWidth: number }) => {
    return { snackbar: state.snackbar, windowWidth: state.windowWidth };
  }
)(SnackBar);
