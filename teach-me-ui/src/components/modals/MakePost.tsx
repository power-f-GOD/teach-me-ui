import React, { useState, useRef, ChangeEvent } from 'react';

import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import Row from 'react-bootstrap/Row';
import Dropdown from 'react-bootstrap/Dropdown';

import { PostEditorState } from '../../types';

import {
  uploadFiles,
  getUploads,
  makePost,
  requestCreatePost
} from '../../actions';

import { Loader, KAvatar, FAIcon, RenderImage } from '../shared';
import Editor from '../crumbs/Editor';

import {
  displayModal,
  dispatch,
  isImage,
  getFileExtension
} from '../../functions';
import { userDeviceIsMobile } from '../..';

const MakePost = (props: any) => {
  const { userData, sendFile, uploadsProp, makePostProp } = props;
  const { profile_photo, displayName } = userData;

  const label = useRef<HTMLLabelElement | any>();
  const label1 = useRef<HTMLLabelElement | any>();

  const [state, setState] = useState<PostEditorState>({
    post: {
      text: ''
    },
    selectedFiles: [],
    selectedUploads: [],
    tempSelectedUploads: [],
    showUploads: false
  });

  if (makePostProp.status === 'fulfilled') {
    dispatch(makePost({ status: 'settled' }));
    displayModal(false);
  }

  const onUpdate = (value: string) => {
    if (label.current && label1.current) {
      label.current.style.display = 'none';
      label1.current.style.display = 'none';
    }

    setState({
      ...state,
      post: {
        ...state.post,
        text: value.trim()
      }
    });
  };

  const removeUpload = (e: any) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    let selectedUploads = [];
    let removed = false;

    for (let file of state.selectedUploads) {
      if (
        e.target.previousElementSibling.getAttribute('id') === file.id &&
        !removed
      ) {
        removed = true;
        continue;
      }

      selectedUploads.push(file);
    }

    setState({
      ...state,
      selectedUploads
    });
  };

  const removeFile = (e: any) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    let selectedFiles = [];
    let removed = false;

    for (let file of state.selectedFiles) {
      if (
        e.currentTarget.previousElementSibling?.getAttribute('title') ===
          file.name &&
        !removed
      ) {
        removed = true;
        continue;
      }

      selectedFiles.push(file);
    }

    setState({
      ...state,
      selectedFiles
    });
  };

  const fileSelectedHandler = (e: ChangeEvent<any>) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    let selectedFiles = state.selectedFiles;
    let numberOfSelectedFiles =
      selectedFiles.length + state.selectedUploads.length;
    let files: Array<File> = [];

    for (let file of e.target.files) {
      if (file.size > 50000000) {
        files = [];
        label.current.style.display = 'block';
        return;
      } else {
        if (numberOfSelectedFiles >= 5) {
          label1.current.style.display = 'block';
          break;
        }

        files.push(file);
        numberOfSelectedFiles++;
      }
    }

    setState({
      ...state,
      selectedFiles: [...state.selectedFiles, ...files]
    });
  };

  const toggleSelectPreUpload = (e: any) => {
    label1.current.style.display = 'none';
    const numberOfUploads =
      state.selectedFiles.length +
      state.selectedUploads.length +
      state.tempSelectedUploads.length;
    const button = e.currentTarget.children[1];
    const element = e.currentTarget.children[0];

    if (button.classList[0] === 'check-button') {
      if (numberOfUploads >= 5) {
        label1.current.style.display = 'block';
        return;
      }
      button.classList.add('check-button-selected');
      button.classList.remove('check-button');
      setState({
        ...state,
        tempSelectedUploads: [
          ...state.tempSelectedUploads,
          {
            url: element.getAttribute('src'),
            id: element.getAttribute('id'),
            title: element.getAttribute('title'),
            image: element.classList[0] === 'img'
          }
        ]
      });
    } else {
      button.classList.remove('check-button-selected');
      button.classList.add('check-button');
      let selectedUploads = [];

      for (let uploaded of state.tempSelectedUploads) {
        if (uploaded.url === element.getAttribute('src')) continue;
        selectedUploads.push(uploaded);
      }

      setState({
        ...state,
        tempSelectedUploads: selectedUploads
      });
    }
  };

  const handleSelectUpload = (e: any) => {
    if (state.tempSelectedUploads[0]) {
      const tempUploads = state.tempSelectedUploads;

      label.current.style.display = 'none';
      label1.current.style.display = 'none';
      setState({
        ...state,
        selectedUploads: [...state.selectedUploads, ...tempUploads],
        tempSelectedUploads: [],
        showUploads: false
      });
    }
  };

  const cancelSelectUpload = (e: any) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    setState({
      ...state,
      tempSelectedUploads: [],
      showUploads: false
    });
  };

  const displayUploads = (e: any) => {
    document.body.click();
    label.current.style.display = 'none';
    label1.current.style.display = 'none';

    if (uploadsProp.status !== 'pending' && !uploadsProp.data[0]) {
      dispatch(getUploads);
    }

    setState({
      ...state,
      showUploads: true
    });
  };

  const hideUploadedFiles = (e: any) => {
    setState({
      ...state,
      showUploads: false
    });
  };

  const onPostSubmit = () => {
    if (state.post.text || state.selectedFiles.length) {
      if (state.selectedFiles[0] || state.selectedUploads[0]) {
        uploadFiles(
          state.selectedFiles,
          requestCreatePost,
          state.selectedUploads,
          'media',
          true,
          { post: state.post }
        );
      } else {
        dispatch(requestCreatePost({ post: state.post, media: [] })(dispatch));
      }
    }
  };

  return (
    <Box p={1} pt={0} className='MakePost'>
      <Row className='container-fluid p-0 mx-auto mb-2'>
        <Box pr={1}>
          <KAvatar
            className='chat-avatar compose-avatar'
            alt={displayName}
            src={profile_photo ? profile_photo : ''}
          />
        </Box>
        <div className='d-flex flex-column justify-content-center flex-grow-1'>
          <span className='font-bold'>{userData.displayName}</span>
          <small>@{userData.username}</small>
        </div>
      </Row>
      <form>
        <Editor onUpdate={onUpdate} />
        {!(state.showUploads && uploadsProp.data[0]) && (
          <Dropdown drop='right' className='upload__dropdown'>
            <Dropdown.Toggle
              title='upload file(s)'
              className='upload__dropdown-toggle'>
              <FAIcon name='paperclip' />
            </Dropdown.Toggle>
            <Dropdown.Menu className='upload__dropdown-menu'>
              <Tooltip title='from device'>
                <IconButton onClick={hideUploadedFiles}>
                  <FAIcon name={userDeviceIsMobile ? 'mobile' : 'desktop'} />
                  <label htmlFor='my-input'></label>
                </IconButton>
              </Tooltip>
              <input
                multiple={true}
                id='my-input'
                onChange={fileSelectedHandler}
                className='d-none'
                type='file'
              />
              <Tooltip title='from previous uploads'>
                <IconButton onClick={displayUploads}>
                  <FAIcon name='cloud' />
                </IconButton>
              </Tooltip>
            </Dropdown.Menu>
          </Dropdown>
        )}

        {!state.showUploads && (
          <Row className='d-flex mx-auto mt-1'>
            <Container component='div' id='upload-grid-box'>
              {state.selectedFiles.map((file: File, i: number) => (
                <div
                  title={file.name}
                  key={i}
                  className={`upload-relative ${
                    isImage(file)
                      ? 'upload-div-wrapper1'
                      : 'upload-non-image-files'
                  }`}>
                  {isImage(file) ? (
                    <RenderImage file={file} />
                  ) : (
                    <p title={file.name}>{getFileExtension(file.name)}</p>
                  )}
                  <button
                    type='button'
                    className='upload-remove-img-btn rounded-circle'
                    onClick={removeFile}>
                    x
                  </button>
                </div>
              ))}

              {state.selectedUploads.map((file: any, i: number) => (
                <div
                  key={i}
                  className={`upload-relative ${
                    file.image
                      ? 'upload-div-wrapper1'
                      : 'upload-non-image-files'
                  }`}
                  title={`${
                    file.title !== 'Untitled' ? file.title : 'from uploads'
                  }`}>
                  {file.image ? (
                    <img
                      id={file.id}
                      className='img'
                      alt={file.name}
                      src={`${file.url}`}
                    />
                  ) : (
                    <p id={file.id}>{file.title}</p>
                  )}
                  <button
                    onClick={removeUpload}
                    type='button'
                    className='upload-remove-img-btn rounded-circle'>
                    x
                  </button>
                </div>
              ))}
            </Container>
          </Row>
        )}
        {state.showUploads &&
          uploadsProp.data[0] &&
          uploadsProp.status !== 'pending' && (
            <Row as='h4' className='upload-select-header'>
              Select files
            </Row>
          )}
        <Container component='p' ref={label} className='upload-label'>
          *files should be maximum of 50mb
        </Container>
        <Container component='p' ref={label1} className='upload-label'>
          *You can post with a maximum of five files
        </Container>
        <Row className='d-flex mx-auto mt-1'>
          <Box component='div' id='grid-box-uploads' className='scroll-image'>
            {state.showUploads ? (
              uploadsProp.status === 'pending' ? (
                <Loader
                  type='ellipsis'
                  inline={true}
                  color='#555'
                  size={6}
                  className='ml-2'
                />
              ) : uploadsProp.data[0] ? (
                uploadsProp.data.map((file: any, i: number) => (
                  <Container
                    onClick={toggleSelectPreUpload}
                    component='div'
                    key={i}
                    className='col-4 upload-div-wrapper'>
                    {file.type === 'image' ? (
                      <img
                        src={file.thumbnail ? file.thumbnail : file.url}
                        className='img'
                        alt={file.public_id}
                        id={file.id}
                        title={`${file.title ? file.title : ''}`}
                      />
                    ) : (
                      <div
                        id={file._id}
                        title={file.title}
                        className='upload-div-wrapper non-image-uploads'>
                        <p>{file.title}</p>
                      </div>
                    )}
                    <button type='button' className='check-button'>
                      ✓
                    </button>
                  </Container>
                ))
              ) : (
                <Container className='no-uploads' component='p'>
                  You have no uploads
                  <button
                    className='cursor-pointer'
                    id='float-button-no-uploads'
                    onClick={cancelSelectUpload}
                    color='secondary'>
                    cancel
                  </button>
                </Container>
              )
            ) : (
              ''
            )}
          </Box>
        </Row>
        {state.showUploads &&
          uploadsProp.data[0] &&
          uploadsProp.status !== 'pending' && (
            <Row className='d-flex mx-auto mt-1'>
              <Container component='div' className='width-100 p-0'>
                <Button
                  onClick={handleSelectUpload}
                  variant='contained'
                  color='primary'>
                  select
                </Button>
                <Button
                  id='upload-float-button'
                  onClick={cancelSelectUpload}
                  variant='contained'
                  color='secondary'>
                  cancel
                </Button>
              </Container>
            </Row>
          )}
        <Row className='d-flex mx-auto mt-1'>
          {!(state.showUploads && uploadsProp.data[0]) && (
            <Button
              disabled={
                makePostProp.status === 'pending' ||
                sendFile.status === 'pending' ||
                (!state.post.text && !state.selectedFiles.length)
              }
              className='Primary post-button major-button contained p-0 flex-grow-1'
              onClick={onPostSubmit}
              color={state.post ? 'primary' : 'default'}>
              {makePostProp.status === 'pending' ||
              sendFile.status === 'pending' ? (
                <>
                  Making post{' '}
                  <Loader
                    type='ellipsis'
                    inline={true}
                    color='#555'
                    size={6}
                    className='ml-2'
                  />
                </>
              ) : (
                'Make'
              )}
            </Button>
          )}
        </Row>
      </form>
    </Box>
  );
};

const mapStateToProps = ({ userData, sendFiles, uploads, makePost }: any) => ({
  userData,
  sendFile: sendFiles,
  uploadsProp: uploads,
  makePostProp: makePost
});

export default connect(mapStateToProps)(MakePost);
