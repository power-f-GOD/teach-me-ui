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

import { PostEditorState } from '../../../../constants';

import { 
  sendFilesToServer,
  getUploads,
  uploads,
  makePost,
  submitPost
} from '../../../../actions';

import Editor from '../../Editor';

import { 
  displayModal, 
  dispatch 
} from '../../../../functions';
import { Container } from '@material-ui/core';

const CreatePost = (props: any) => {
  const { userData, sendFile, uploadsProp, makePostProp } = props;
  const { profile_photo, displayName } = userData;
  const label = useRef<HTMLLabelElement | any>();
  const label1 = useRef<HTMLLabelElement | any>();

  const [state, setState] = useState<PostEditorState>({
    mentionsKeyword: '',
    post: {
      text: ''
    },
    selectedFiles: [],
    selectedUploads: [],
    tempSelectedUploads: []
  });

  if (makePostProp.status === 'fulfilled') {
    dispatch(makePost({status: 'settled'}));
    displayModal(false);
  }

  const onUpdate = (value: string) => {
    setState({
      ...state,
      post: {
        ...state.post,
        text: value
      }
    })
  };

  const prev = useRef<HTMLDivElement | any>('');

  const isImage = (file: File) => {
    return file['type'].split('/')[0] === 'image';
  }

  const removeUpload = (e: any) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    prev.current.removeChild(e.target!.parentNode)
    let selectedUploads = [];
    for (let file of state.selectedUploads) {
      if (e.target.previousElementSibling.getAttribute('src') === file.url) continue;
      
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
    prev.current.removeChild(e.target!.parentNode)
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

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop();
  }

  const preview = (files: any, online: boolean = false) => {
    if (online) {
      for (let file of files) {
        let div = document.createElement('div');
        let button = document.createElement('button');
        let cancelText = document.createTextNode('x');
        button.appendChild(cancelText);
        div.classList.add('col-4', 'div-wrapper');
        button.setAttribute('type', 'button');
        button.classList.add('remove-img-btn', 'rounded-circle');
        button.onclick = removeUpload;
        let img = document.createElement('img');
        img.classList.add('img');
        img.setAttribute('title', 'from uploads');
        img.setAttribute('src', `${file.url}`)
        div.appendChild(img);
        div.appendChild(button);
        (prev.current as HTMLDivElement).appendChild(div);
      }
    } else {
      for (let file of files) {
        let div = document.createElement('div');
        let button = document.createElement('button');
        let cancelText = document.createTextNode('x');
        button.appendChild(cancelText);
        div.classList.add('col-4', 'div-wrapper');
        button.setAttribute('type', 'button');
        button.classList.add('remove-img-btn', 'rounded-circle');
        button.onclick = removeFile;
        (prev.current as HTMLDivElement).appendChild(div);
        if (isImage(file)) {
          let img = document.createElement('img');
          let reader = new FileReader();
          reader.onload = (e) => {
            img.setAttribute('src', e.target!.result as string);
          }
          reader.readAsDataURL(file);

          img.classList.add('img');
          img.setAttribute('title', `${file.name}`);
          div.appendChild(img);
          div.appendChild(button);
          (prev.current as HTMLDivElement).appendChild(div);
        } else {
          let p = document.createElement('p');
          let text = document.createTextNode(`.${getFileExtension(file.name)}`)
          div.classList.remove('div-wrapper');
          div.classList.add('non-image-files');
          div.setAttribute('title', `${file.name}`)
          p.appendChild(text);
          div.appendChild(p);
          div.appendChild(button);

          (prev.current as HTMLDivElement).appendChild(div);
        }
      }
    }
  }

  

  const fileSelectedHandler = (e: ChangeEvent<any>) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    let selectedFiles = state.selectedFiles;
    let numberOfSelectedFiles = (selectedFiles.length + state.selectedUploads.length);
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
        };
        files.push(file);
      }
    }
    Array.prototype.push.apply(selectedFiles, files);
    preview(files);
    setState({
      ...state,
      selectedFiles
    });
  };
  
 
  const onPostSubmit = () => {
    if (state.post.text) {
      if (state.selectedFiles[0] || state.selectedUploads[0]) {
        sendFilesToServer(state.selectedFiles, submitPost, state.post, state.selectedUploads);
      } else {
        dispatch(submitPost(state.post, [])(dispatch));
      }
    }
  }

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
            id: button.previousElementSibling.getAttribute('id')
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
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    const tempUploads = state.tempSelectedUploads;
    prev.current.style.display = 'flex';
    preview(tempUploads, true);
    dispatch(uploads({
      status: 'settled',
      data: [],
      error: false
    }))
    setState({
      ...state,
      selectedUploads: [
        ...state.selectedUploads, 
        ...tempUploads
      ],
      tempSelectedUploads : []
    })
  }

  const cancelSelectUpload = (e: any) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    prev.current.style.display = 'flex';
    dispatch(uploads({
      status: 'settled',
      data: [],
      error: false
    }));
    setState({
      ...state,
      tempSelectedUploads : []
    });
  }

  const displayUploads = (e: any) => {
    document.dispatchEvent(new MouseEvent('click'));
    dispatch(getUploads);
    prev.current.style.display = 'none';
  }

  const hideUploadedFiles = (e: any) => {
    dispatch(uploads({
      status: 'settled',
      data: [],
      error: false
    }))
  }

  return (
    <Box p={1} pt={0}>
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
      <Dropdown drop='up' className={`${uploadsProp.status === 'fulfilled' && uploadsProp.data[0] ? 'display-none' : 'display-block'}`}>
        <Dropdown.Toggle id='dropdown'>
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
        <input
          multiple={true}
          id='my-input'
          onChange={fileSelectedHandler}
          className='display-none'
          type={'file'}
        />
        <Row className='d-flex mx-auto mt-1'>
          <Container component='div' ref={prev} id='grid-box'>
            
          </Container>
        </Row>
        <Row as='h4'
        className={`${uploadsProp.status === 'fulfilled' && uploadsProp.data[0] ? 'display-block' : 'display-none'} select-header`}
        >Select files</Row>
        <Container
          component='p'
          ref={label}
          className='upload-label'>
          files should be maximum of 50mb
        </Container>
        <Container
          component='p'
          ref={label1}
          className='upload-label'
          >
          You can select a maximum of five files
        </Container>
        <Row className='d-flex mx-auto mt-1'>
          <Box
            component='div'
            id='grid-box' 
            className='scroll-image'
            
          >
            {uploadsProp.status === 'pending' 
            ? <CircularProgress className='upload-progress margin-auto'/> 
            : uploadsProp.data[0] 
            ? uploadsProp.data.map((file: any, i: number) => (
              <Container component='div' key={i} className='col-4 div-wrapper'>
                <img 
                  src={file.url} 
                  className='img' 
                  alt={file.public_id} 
                  id={file._id}
                />
                <button onClick={toggleSelectPreUpload} type='button' className='check-button'>
                  ✓
                </button>
              </Container>
            ))
            : <Row 
                as='p' 
                className={`no-uploads ${uploadsProp.status !== 'settled' ? 'display-block' : 'display-none'}`}
              >You have no uploads</Row>
            }
          </Box>
        </Row>
        <Row className='d-flex mx-auto mt-1'>
          <Container component='div' className={`${uploadsProp.status === 'fulfilled' && uploadsProp.data[0] ? 'display-block' : 'display-none'} width-100`}
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
        <Row className='d-flex mx-auto mt-1'>
          <Button
            className={`${uploadsProp.status === 'fulfilled' && uploadsProp.data[0] ? 'display-none' : 'display-block'} post-button major-button Primary contained p-0 flex-grow-1`}
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
