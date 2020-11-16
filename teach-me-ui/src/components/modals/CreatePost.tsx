import React, {
  useState, 
  useRef,
  ChangeEvent
} from 'react';

import { connect } from 'react-redux';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import AttachmentIcon from '@material-ui/icons/Attachment';

import Row from 'react-bootstrap/Row';
import Dropdown from 'react-bootstrap/Dropdown';

import { CustomFile, PostEditorState } from '../../constants';

import { 
  sendFilesToServer,
  getUploads,
  makePost,
  submitPost,
} from '../../actions';

import Editor from '../crumbs/Editor';

import { 
  displayModal, 
  dispatch,
  isImage,
  getFileExtension
} from '../../functions';
import { Container } from '@material-ui/core';


const RenderImage = (props: {file: CustomFile}) => {
  const { file } = props;
  const img = useRef<any | undefined>();

  let reader = new FileReader();
  reader.onload = (e) => {
    img.current.setAttribute('src', e.target!.result as string);
  }
  reader.readAsDataURL(file);

  return (
    <img
      ref={img} 
      className='img'
      alt={file.name}
      title={file.name}/> 
  )
}


const CreatePost = (props: any) => {
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
    dispatch(makePost({status: 'settled'}));
    window.history.back();
    displayModal(false);
  }

  const removeModal = () => {
    displayModal(false, true);
  }

  const closeModal = (e: any) => {
    if (String(window.location.hash)  === '') removeModal();
  }

  window.onhashchange = closeModal;

  setTimeout(() => {
    window.location.hash = 'modal';
  }, 0);

  const onUpdate = (value: string) => {
    setState({
      ...state,
      post: {
        ...state.post,
        text: value
      }
    })
  };

  const removeUpload = (e: any) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    let selectedUploads = [];
    let removed = false;
    for (let file of state.selectedUploads) {
      if (e.target.previousElementSibling.getAttribute('id') === file.id && !removed) {
        removed = true;
        continue;
      }
      selectedUploads.push(file);
    }
    setState({
      ...state,
      selectedUploads
    })
  }

  const removeFile = (e: any) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    let selectedFiles = [];
    let removed = false
    for (let file of state.selectedFiles) {
      if (e.target.previousElementSibling.getAttribute('title') === file.name && !removed) {
        removed = true;
        continue;
      }
      
      selectedFiles.push(file);
    }
    setState({
      ...state,
      selectedFiles
    })
  };

  const fileSelectedHandler = (e: ChangeEvent<any>) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    let selectedFiles = state.selectedFiles;
    let numberOfSelectedFiles = (selectedFiles.length + state.selectedUploads.length);
    let files: Array<CustomFile> = [];
    for (let file of e.target.files) {
      if (file.size > 50000000) {
        files = [];
        label.current.style.display = 'block';
        return;
      } else {
        if (numberOfSelectedFiles >= 5) {
          label1.current.style.display = 'block';
          break;
        };
        files.push(file);
        numberOfSelectedFiles++;
      }
    }
    Array.prototype.push.apply(selectedFiles, files);
    setState({
      ...state,
      selectedFiles
    });
  };

  const toggleSelectPreUpload = (e: any) => {
    label1.current.style.display = 'none';
    const numberOfUploads = (state.selectedFiles.length + state.selectedUploads.length + state.tempSelectedUploads.length);
    const button = e.target;
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
            url: button.previousElementSibling.getAttribute('src'), 
            id: button.previousElementSibling.getAttribute('id'),
            title: button.previousElementSibling.getAttribute('title'),
            image: (button.previousElementSibling.classList[0] === 'img')
          }
        ]
      })
    } else {
      button.classList.remove('check-button-selected');
      button.classList.add('check-button');
      let selectedUploads = []
      for (let uploaded of state.tempSelectedUploads) {
        if (uploaded.url === button.previousElementSibling.getAttribute('src')) continue;
          selectedUploads.push(uploaded)
      }
      setState({
        ...state,
        tempSelectedUploads: selectedUploads
      })
    }
  }

  const handleSelectUpload = (e: any) => {
    if (state.tempSelectedUploads[0]) {
      label.current.style.display = 'none';
      label1.current.style.display = 'none';
      const tempUploads = state.tempSelectedUploads;
      setState({
        ...state,
        selectedUploads: [
          ...state.selectedUploads, 
          ...tempUploads
        ],
        tempSelectedUploads : [],
        showUploads: false
      })
    }
  }

  const cancelSelectUpload = (e: any) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    setState({
      ...state,
      tempSelectedUploads : [],
      showUploads: false
    });
  }

  const displayUploads = (e: any) => {
    document.dispatchEvent( new MouseEvent('click'));
    if (uploadsProp.status !== 'pending' && !uploadsProp.data[0]) {
      dispatch(getUploads);
    }
    setState({
      ...state,
      showUploads: true
    });
  }

  const hideUploadedFiles = (e: any) => {
    setState({
      ...state,
      showUploads: false
    });
  }

  const onPostSubmit = () => {
    if (state.post.text) {
      if (state.selectedFiles[0] || state.selectedUploads[0]) {
        sendFilesToServer(state.selectedFiles, submitPost, state.selectedUploads, 'media', true, {post: state.post});
      } else {
        dispatch(submitPost({post: state.post, media: []})(dispatch));
      }
    }
  }

  return (
    <Box p={1} pt={0} className='post'>
      <Row className='container-fluid p-0 mx-auto'>
        <Box pr={1}>
          <Avatar
            component='span'
            className='chat-avatar compose-avatar'
            alt={displayName}
            src={profile_photo ? profile_photo : `images/${userData.avatar}`}
          />
        </Box>
        <div className='d-flex flex-column justify-content-center flex-grow-1'>
          <span>{userData.displayName}</span>
          <small>{userData.username}</small>
        </div>
      </Row>
      <form>
      <Editor onUpdate={onUpdate} />
      {!(state.showUploads && uploadsProp.data[0]) && (
        <Dropdown drop='up'>
          <Dropdown.Toggle title='attach file(s)' id='dropdown'>
              <AttachmentIcon className='cursor-pointer'/>
          </Dropdown.Toggle>
          <Dropdown.Menu className='drop-menu'>
            <label 
              htmlFor='my-input' 
              onClick={hideUploadedFiles} 
              className='menu-options'
            >
              local Disk
            </label>
            <div id='divider'></div>
            <div className='menu-options' onClick={displayUploads}>
              uploaded files
            </div>
          </Dropdown.Menu>
        </Dropdown>
      )}
        <input
          multiple={true}
          id='my-input'
          onChange={fileSelectedHandler}
          className='display-none'
          type={'file'}
        />
        {!state.showUploads && (
          <Row className='d-flex mx-auto mt-1'>
            <Container component='div' id='grid-box'>
              {state.selectedFiles.map((file: CustomFile, i: number) => (
                <div 
                  title={file.name}
                  key={i} 
                  className={`relative ${isImage(file) ? 'div-wrapper1' : 'non-image-files'}`}>
                  {isImage(file) ? (
                    <RenderImage file={file}/>
                  ) : (
                    <p title={file.name}>{getFileExtension(file.name)}</p>
                  )}
                  <button 
                    type='button' 
                    className='remove-img-btn rounded-circle'
                    onClick={removeFile}>
                      x
                  </button>
                </div>
              ))}
 
              {state.selectedUploads.map((file: any, i: number) => (
                <div 
                  key={i} 
                  className={`relative ${file.image ? 'div-wrapper1' : 'non-image-files'}`}
                  title={`${file.title !== 'Untitled' ? file.title : 'from uploads'}`}>
                  {file.image ? (
                    <img 
                      id={file.id}
                      className='img'
                      alt={file.name} 
                      src={`${file.url}`}/>
                  ) : (
                    <p id={file.id}>{file.title}</p>
                  )}
                  <button
                    onClick={removeUpload} 
                    type='button'
                    className='remove-img-btn rounded-circle'>
                      x
                  </button>
                </div>
              ))}
            </Container>
          </Row>
        )}
        {(state.showUploads && uploadsProp.data[0]) && (
          <Row as='h4'
            className='select-header'>
              Select files
          </Row>
        )}
        <Container
          component='p'
          ref={label}
          className='upload-label'>
          *files should be maximum of 50mb
        </Container>
        <Container
          component='p'
          ref={label1}
          className='upload-label'
          >
          *You can post with a maximum of five files
        </Container>
        <Row className='d-flex mx-auto mt-1'>
          <Box
            component='div'
            id='grid-box-uploads' 
            className='scroll-image'
          >
            {state.showUploads ?
              uploadsProp.status === 'pending' 
              ? <CircularProgress className='upload-progress margin-auto'/> 
              : uploadsProp.data[0] 
              ? uploadsProp.data.map((file: any, i: number) => (
                <Container component='div' key={i} className='col-4 div-wrapper'>
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
                    className='div-wrapper non-image-uploads'>
                      <p>{file.title}</p>
                  </div>
                  )}
                  <button onClick={toggleSelectPreUpload} type='button' className='check-button'>
                    ✓
                  </button>
                </Container>
              ))
              : <Container
                  className='no-uploads'
                  component='p' 
                >You have no uploads</Container>
              : ''
            }
          </Box>
        </Row>
        {state.showUploads && uploadsProp.data[0] && (
          <Row className='d-flex mx-auto mt-1'>
            <Container component='div' className='width-100'
            >
            <Button 
              onClick={handleSelectUpload}
              variant='contained'
              color='primary'>
                select
            </Button>
            <Button 
              id='float-button'
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
              id={`${ (
                makePostProp.status === 'pending' 
                || sendFile.status === 'pending' 
                || !(state.post.text)
              ) ? 'background-grey' : ''}`}
              className='post-button major-button Primary contained p-0 flex-grow-1'
              onClick={onPostSubmit}
              color={state.post ? 'primary' : 'default'}
            >
              {makePostProp.status === 'pending' ? (
                <CircularProgress size={28} color='inherit' />
              ) : sendFile.status === 'pending' ? (
                'uploading files...'
              ) : (
                'Post'
              )} 
            </Button>
          )}
        </Row>
      </form>
    </Box>
  );
};

const mapStateToProps = ({ 
  userData, 
  sendFiles, 
  uploads, 
  makePost 
}: any) => ({ 
  userData, 
  sendFile: sendFiles, 
  uploadsProp: uploads,
  makePostProp: makePost
});

export default connect(mapStateToProps)(CreatePost);
