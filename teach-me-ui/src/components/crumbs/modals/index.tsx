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

const removeModal = (event: any) => {
  displayModal(false);
  dispatch(uploads({
    status: 'settled',
    err: false,
    data: []
  }))
};

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
  }
  return (
    <Modal
      onClose={removeModal}
      className='modal-wrapper'
      open={props.modal.open}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 300,
        style: {
          background: 'rgba(0,0,0,0.6)'
        }
      }}>
      <Fade in={props.modal.open}>
        <Box className='main-modal'>
          <div className=' d-flex container justify-content-between action-bar p-0'>
            <span></span>
            <h4 className='m-0 text-center align-self-center theme-primary-darker'>{props.modal.meta?.title}</h4>
            <div onClick={removeModal}>
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
          <Box padding={props.modal.type === 'EDIT_PROFILE' ? '20px' : '7px'}>{modalBody}</Box>
        </Box>
      </Fade>
    </Modal>
  );
};

const mapStateToProps = ({ modal }: any) => ({ modal });

export default connect(mapStateToProps)(ModalFrame);