import React from 'react';

import Modal from '@material-ui/core/Modal';
import Box from '@material-ui/core/Box';

import CloseIcon from '@material-ui/icons/Close';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
    <Modal className='modal-wrapper' open={props.modal.open}>
      <Box className='main-modal p-2'>
        <Row className='container-fluid action-bar p-0 mx-auto'>
          <Col onClick={removeModal}>
            <Box
              component='button'
              bgcolor='transparent'
              className='close-btn'
              height='30px'
              width='30px'
              border='none'
              borderRadius='50%'>
              <CloseIcon />
            </Box>
          </Col>
        </Row>
        <Box padding='10px'>{modalBody}</Box>
      </Box>
    </Modal>
  );
};

const mapStateToProps = ({ modal }: any) => ({ modal });

export default connect(mapStateToProps)(ModalFrame);
