import React from 'react';

import Modal from '@material-ui/core/Modal';
import Box from '@material-ui/core/Box';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';

import CloseIcon from '@material-ui/icons/Close';

import { connect } from 'react-redux';

import { 
  displayModal,
  dispatch 
} from '../../../functions';
import { uploads } from '../../../actions';
import CreatePost from './components/CreatePost';
import CreateRepost from './components/CreateRepost';
import EditProfile from './components/Profile.edit';
import UploadsPreview from './components/UploadsPreview';
import Notifications from './components/Notifications';

const removeModal = (event: any) => {
  displayModal(false);
  dispatch(uploads({
    status: 'settled',
    err: false,
    data: []
  }))
};

const removeNotificationModal = (event: any) => {
  displayModal(false, true);
}

const ModalFrame = (props: any) => {
  let modalBody = null;

  switch (props.modal.type) {
    case 'CREATE_POST':
      modalBody = <CreatePost />;
      break;
    case 'CREATE_REPOST':
      modalBody = <CreateRepost {...props.modal.meta?.post} />;
      break;
    case 'EDIT_PROFILE':
      modalBody = <EditProfile />;
      break;
    case 'SELECT_PHOTO':
      modalBody = <UploadsPreview title={props.modal.meta?.title} />;
      break;
    case 'NOTIFICATIONS':
      modalBody = <Notifications />;
  }
  return (
    <Modal
      onClose={props.modal.type === 'NOTIFICATIONS' ? removeNotificationModal : removeModal}
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
        <Box className='main-modal' style={{width: props.modal.type === 'NOTIFICATIONS' ? 'max-content' : '90vw'}}>
          <div style={{marginBottom: props.modal.type === 'NOTIFICATIONS' ? '0px' : '0.5rem'}} className='cancel-modal d-flex container justify-content-between action-bar p-0'>
            <span></span>
            <h4 className='m-0 text-center align-self-center font-bold'>{props.modal.meta?.title}</h4>
            <div onClick={props.modal.type === 'NOTIFICATIONS' ? removeNotificationModal : removeModal}>
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
          <Box className='modal-contents' padding={props.modal.type === 'EDIT_PROFILE' ? '20px' : props.modal.type === 'NOTIFICATIONS' ? '0px' : '7px'}>{modalBody}</Box>
        </Box>
      </Fade>
    </Modal>
  );
};

const mapStateToProps = ({ modal }: any) => ({ modal });

export default connect(mapStateToProps)(ModalFrame);