import React from 'react';  

import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';

import Box from '@material-ui/core/Box';

import Row from 'react-bootstrap/Row';

import { 
  dispatch, 
  displayModal 
} from '../../functions';
import { 
  getUploads, 
  sendFilesToServer, 
  updateUserDataRequest 
} from '../../actions';
import { CircularProgress } from '@material-ui/core';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';

const UploadsPreview = (props: any) => {

  if (props.uploads.status !== 'pending' && !props.uploads.data[0]) {
    dispatch(getUploads);
  }

  const removeModal = () => {
    displayModal(false, true);
  }

  const closeModal = (e: any) => {
    if (String(window.location.hash)  === '') removeModal();
  }

  window.onhashchange = closeModal;

  window.location.hash = 'modal';

  const {
    sendFiles,
    uploads
  } = props;

  const fileSelectedHandler = (e: any) => {
    if (props.title === 'Select Profile Photo') {
      sendFilesToServer(
        [e.target.files[0]], 
        updateUserDataRequest,
        [],
        'profile_photo',
        false,
      );
    } else {
      sendFilesToServer(
        [e.target.files[0]], 
        updateUserDataRequest,
        [],
        'cover_photo',
        false,
      );
    }
  }

  const selectUpload = (id: string) => {
    if (props.title === 'Select Profile Photo') {
      dispatch(updateUserDataRequest({profile_photo: id})(dispatch));
    } else {
      dispatch(updateUserDataRequest({cover_photo: id})(dispatch));
    }
    window.history.back();
    displayModal(false);
  }

  return (
    <Box p={1} pt={0}>
      {sendFiles.status === 'pending'
      ? ( 
        <Row className='d-flex mx-auto mt-1'>
          <Box
            className='bold'
            component='p'
            >
              Uploading... <CircularProgress color='primary' size={13}/>
          </Box>
        </Row> 
      ) : ''}
      <Row className='d-flex mx-auto mt-1'>
        <input
          id='photo-input'
          onChange={fileSelectedHandler}
          className='display-none'
          type='file'
          accept='image/*'
        />
        <label 
          htmlFor='photo-input'
          className='display-flex photo-upload-button'
          >
            <AddAPhotoIcon/>  Upload Photo
        </label>
      </Row>
      <Row as='h4'
        className={`${uploads.data[0] ? 'display-block' : 'display-none'} select-header margin-top-1`}
        > Uploads
      </Row>
      <Row className='d-flex mx-auto mt-1'>
        <Box
          component='div'
          id='grid-box1' 
          className='scroll-image'  
        >
          {uploads.status === 'pending' 
          ? <CircularProgress className='upload-progress margin-auto'/> 
          : uploads.data.map((file: any, i: number) => {
              return (
                file.type === 'image' ? (
                  <Container 
                    key={i} 
                    className='col-4 div-wrapper cursor-pointer'
                    onClick={(e: any) => {
                      selectUpload(file._id);
                    }}
                  >
                    <img 
                      src={file.thumbnail} 
                      className='img' 
                      alt={file.public_id} 
                      id={file._id}
                    />
                  </Container>
                ) : ''
              )
            })}
        </Box>
      </Row>
    </Box>
  )
}

const mapStateToProps = ({
  sendFiles,
  uploads,
}: any) => ({
  sendFiles,
  uploads,
})
export default connect(mapStateToProps)(UploadsPreview);