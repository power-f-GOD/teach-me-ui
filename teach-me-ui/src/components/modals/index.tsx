import React from 'react';

import Modal from '@material-ui/core/Modal';
import Box from '@material-ui/core/Box';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';

import CloseIcon from '@material-ui/icons/Close';

import { connect } from 'react-redux';

import {
  dispatch,
  displayModal,
  eraseLastHistoryStateOnClick
} from '../../functions';
import MakePost from './MakePost';
import CreateRepost from './MakeRepost';
import EditProfile from './Profile.edit';
import UploadsPreview from './UploadsPreview';
import Notifications from './Notifications';
import CreateQuestionOrAnswer from './AskQuestion';

import { uploads } from '../../actions';
import {
  MAKE_POST,
  MAKE_REPOST,
  NOTIFICATIONS,
  SELECT_PHOTO,
  EDIT_PROFILE,
  CREATE_QUESTION,
  CREATE_ANSWER
} from '../../constants/modals';

const removeModal = (event: any) => {
  eraseLastHistoryStateOnClick(window.location.pathname);

  displayModal(false);
  dispatch(
    uploads({
      showUploads: false
    })
  );
};

const removeNotificationModal = (event: any) => {
  eraseLastHistoryStateOnClick(window.location.pathname);

  displayModal(false, true);
};

let modalBody: JSX.Element | null = null;

const ModalFrame = (props: any) => {
  switch (props.modal.type) {
    case MAKE_POST:
      modalBody = <MakePost />;
      break;
    case MAKE_REPOST:
      modalBody = <CreateRepost post={props.modal.meta?.post} />;
      break;
    case EDIT_PROFILE:
      modalBody = <EditProfile />;
      break;
    case SELECT_PHOTO:
      modalBody = <UploadsPreview title={props.modal.meta?.title} />;
      break;
    case NOTIFICATIONS:
      modalBody = <Notifications />;
      break;
    case CREATE_QUESTION:
      modalBody = <CreateQuestionOrAnswer />;
      break;
    case CREATE_ANSWER:
      modalBody = <CreateQuestionOrAnswer answer />;
  }
  return (
    <Modal
      onClose={
        props.modal.type === NOTIFICATIONS
          ? removeNotificationModal
          : removeModal
      }
      className='modal-wrapper'
      open={props.modal.open}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 300,
        style: {
          background: 'rgba(0,0,0,0.5)'
        }
      }}>
      <Fade in={props.modal.open}>
        <Box
          className='main-modal'
          style={{
            width: props.modal.type === NOTIFICATIONS ? 'max-content' : '90vw'
          }}>
          <div
            style={{
              marginBottom:
                props.modal.type === NOTIFICATIONS ? '0px' : '0.5rem'
            }}
            className='cancel-modal d-flex container justify-content-between action-bar p-0'>
            <span></span>
            <h4 className='m-0 text-center align-self-center font-bold'>
              {props.modal.meta?.title}
            </h4>
            <div
              onClick={
                props.modal.type === NOTIFICATIONS
                  ? removeNotificationModal
                  : removeModal
              }>
              <Box
                component='button'
                className='close-btn'
                height='30px'
                width='30px'
                border='none'
                borderRadius='50%'>
                <CloseIcon />
              </Box>
            </div>
          </div>
          <Box
            className='modal-contents'
            padding={
              props.modal.type === 'EDIT_PROFILE'
                ? '20px'
                : props.modal.type === NOTIFICATIONS
                ? '0px'
                : '7px'
            }>
            {modalBody}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

const mapStateToProps = ({ modal }: any) => ({ modal });

export default connect(mapStateToProps)(ModalFrame);
