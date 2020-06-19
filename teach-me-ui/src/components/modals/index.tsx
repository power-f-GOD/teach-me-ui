import React from 'react';

import Modal from '@material-ui/core/Modal';
import Box from '@material-ui/core/Box';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';

import CloseIcon from '@material-ui/icons/Close';

import { connect } from 'react-redux';

import { displayModal } from '../../functions';
import CreatePost from './components/CreatePost';

const removeModal = (event: any) => {
  displayModal(false);
};

const ModalFrame = (props: any) => {
  let modalBody = null;

  switch (props.modal.type) {
    case 'CREATE_POST':
      modalBody = <CreatePost />;
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
          background: '#ddd5'
        }
      }}>
      <Fade in={props.modal.open}>
        <Box className='main-modal'>
          <div className=' d-flex container justify-content-between action-bar p-0'>
            <span></span>
            <h4 className='m-0 text-center'>{props.modal.title}</h4>
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
          <Box padding='7px'>{modalBody}</Box>
        </Box>
      </Fade>
    </Modal>
  );
};

const mapStateToProps = ({ modal }: any) => ({ modal });

export default connect(mapStateToProps)(ModalFrame);
