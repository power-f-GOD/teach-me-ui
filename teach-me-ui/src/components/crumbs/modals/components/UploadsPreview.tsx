import React, {
  useEffect
} from 'react';  

import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';

import Box from '@material-ui/core/Box';

import Row from 'react-bootstrap/Row';

import { 
  dispatch, 
  displayModal 
} from '../../../../functions';
import { 
  getUploads, 
  getUserDetails, 
  sendFilesToServer, 
  updateUserDataRequest 
} from '../../../../actions';
import { CircularProgress } from '@material-ui/core';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';

const UploadsPreview = (props: any) => {

  useEffect(() => {
    dispatch(getUploads)
  },[])

  const {
    sendFiles,
    uploads,
    getUserDetailsProp
  } = props;

  if (getUserDetailsProp.status === 'fulfilled') {
    displayModal(false);
    dispatch(getUserDetails({status: 'settled'}));
  }

  const fileSelectedHandler = (e: any) => {
    if (props.title === 'Select Profile Photo') {
      sendFilesToServer(
        [e.target.files[0]], 
        updateUserDataRequest,
        {profilePhoto: true}
      );
    } else {
      sendFilesToServer(
        [e.target.files[0]], 
        updateUserDataRequest,
        {coverPhoto: true}
      );
    }
  }

  const selectUpload = (id: string) => {
    if (props.title === 'Select Profile Photo') {
      dispatch(updateUserDataRequest({profile_photo: id}, true)(dispatch));
    } else {
      dispatch(updateUserDataRequest({cover_photo: id}, true)(dispatch));
    }
  }

  return (
    <Box p={1} pt={0}>
      {sendFiles.status === 'pending'
      ? ( 
        <Row className='d-flex mx-auto mt-1'>
          <Box
            component='p'
            >
              Uploading...
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
        className={`${uploads.status === 'fulfilled' && uploads.data[0] ? 'display-block' : 'display-none'} select-header`}
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
                      src={file.url} 
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
  getUserDetails
}: any) => ({
  sendFiles,
  uploads,
  getUserDetailsProp: getUserDetails
})
export default connect(mapStateToProps)(UploadsPreview);