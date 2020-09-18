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

import { PostEditorState, UserData } from '../../../../constants';

import { 
  sendFilesToServer,
  getUploads,
  uploads
} from '../../../../actions';

import Editor from '../../Editor';

import { useSubmitPost } from '../../../../hooks/api';
import { 
  displayModal, 
  dispatch 
} from '../../../../functions';

const CreatePost = (props: { userData: UserData; sendFile: any, uploadsProp: any }) => {
  const { userData, sendFile, uploadsProp } = props;
  const { avatar, profile_photo, displayName } = userData;
  const label = useRef<HTMLLabelElement | any>();
  const label1 = useRef<HTMLLabelElement | any>();

  const [state, setState] = useState<PostEditorState>({
    mentionsKeyword: '',
    post: {
      text: ''
    },
    selectedFiles: [],
    selectedUploads: []
  });

  const [submitPost, , isSubmitting] = useSubmitPost({...state.post, media:sendFile.data});

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
  const preUploadedFiles = useRef<HTMLDivElement | any>();

  const isImage = (file: File) => {
    return file['type'].split('/')[0] === 'image';
  }

  const removeUpload = (e: any) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    prev.current.removeChild(e.target!.parentNode)
    let selectedUploads = [];
    for (let file of state.selectedUploads) {
      console.log(e.target.previousElementSibling.getAttribute('src'), file.url);
      if (e.target.previousElementSibling.getAttribute('src') === file.url) continue;
      
      selectedUploads.push(file);
    }
    setState({
      ...state,
      selectedUploads
    })
  }

  const removeFile = (e: any) => {
    console.log(state.selectedFiles, state.selectedUploads);
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    prev.current.removeChild(e.target!.parentNode)
    let selectedFiles = [];
    for (let file of state.selectedFiles) {
      console.log(e.target.previousElementSibling.getAttribute('title'), file.name);
      if (e.target.previousElementSibling.getAttribute('title') === file.name) continue;
      
      selectedFiles.push(file);
    }
    setState({
      ...state,
      selectedFiles
    })
  };

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
          let text = document.createTextNode(`${file.name}`)
          div.appendChild(text);
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
    let numberOfSelectedFiles = (selectedFiles.length + state.selectedUploads);
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
    })
  };
  
 
  const onPostSubmit = () => {
    if (state.post.text) {
      if (state.selectedFiles[0] || state.selectedUploads[0]) {
        sendFilesToServer(state.selectedFiles, submitPost, displayModal, state.selectedUploads)
      } else {
        submitPost().then(() => {
          if (!isSubmitting) {
            displayModal(false);
          }
        });
      }
    }
  }

  const toggleSelectPreUpload = (e: any) => {
    label1.current.style.display = 'none';
    const numberOfUploads = (state.selectedFiles.length + state.selectedUploads.length)
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
        selectedUploads: [...state.selectedUploads, {url: button.previousElementSibling.getAttribute('src'), id: button.previousElementSibling.getAttribute('id')}]
      })

    } else {
      button.classList.remove('check-button-selected');
      button.classList.add('check-button');
      let selectedUploads = []
      for (let uploaded of state.selectedUploads) {
        if (uploaded.url === button.previousElementSibling.getAttribute('src')) continue;
          selectedUploads.push(uploaded)
      }
      setState({
        ...state,
        selectedUploads
      })
    }
      
  }

  const handleSelectUpload = (e: any) => {
    prev.current.style.display = 'flex';
    preUploadedFiles.current.style.display = 'none';
    preview(state.selectedUploads, true);
    dispatch(uploads({
      status: 'settled',
      data: [],
      error: false
    }))
  }

  const displayUploads = (e: any) => {
    dispatch(getUploads);
    prev.current.style.display = 'none';
    preUploadedFiles.current.style.display = 'flex';
  }

  const hideUploadedFiles = (e: any) => {
    preUploadedFiles.current.style.display = 'none';
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
            src={`/images/${profile_photo || avatar}`}
          />
        </Box>
        <div className='d-flex flex-column justify-content-center flex-grow-1'>
          <span>{userData.displayName}</span>
          <small>{userData.username}</small>
        </div>
      </Row>
      <form>
      <Editor onUpdate={onUpdate} />
      <Dropdown drop='up'>
        <Dropdown.Toggle id='dropdown'>
            <AttachmentIcon style={{cursor: 'pointer'}}/>
        </Dropdown.Toggle>
        <Dropdown.Menu className='drop-menu'>
          
            <label htmlFor='my-input' onClick={hideUploadedFiles} className='menu-options'>
              local Disk
            </label>
            <div id='divider'></div>
            <div className='menu-options' onClick={displayUploads}>
              uploaded files
            </div>
        </Dropdown.Menu>
      </Dropdown>
       
        
          
        <label
          htmlFor='my-input'
          ref={label}
          className='upload-label'>
          files should be maximum of 50mb
        </label>
        <label
          htmlFor='my-input'
          ref={label1}
          className='upload-label'
          >
          You can upload a maximum of five files
        </label>
        <input
          multiple={true}
          id='my-input'
          onChange={fileSelectedHandler}
          style={{ display: 'none' }}
          type={'file'}
        />
        <Row className='d-flex mx-auto mt-1'>
          <div ref={prev} id='grid-box'>
            
          </div>
        </Row>
        <Row className='d-flex mx-auto mt-1'>
          <div id='grid-box' className='scroll-image' style={{display: 'none'}} ref={preUploadedFiles}>
            {uploadsProp.status === 'pending' 
            ? <CircularProgress style={{margin: 'auto', color: 'green'}}/> 
            : uploadsProp.data[0] 
            ? uploadsProp.data.map((file: any, i: number) => (
              <div key={i} className='col-4 div-wrapper'>
                <img src={file.url} className='img' alt={file.public_id} id={file._id}/>
                <button onClick={toggleSelectPreUpload} type='button' className='check-button'>
                  ✓
                </button>
              </div>
            ))
            : <p style={{margin: 'auto', width: '50%'}}>you have no uploads</p>
            }
          </div>
        </Row>
        <Row className='d-flex mx-auto mt-1'>
          <Button 
            style={{display: uploadsProp.status === 'fulfilled' && uploadsProp.data[0] ? 'block' : 'none'}}
            onClick={handleSelectUpload}
            variant='contained'
            color='primary'>
              select
          </Button>
        </Row>
        <Row className='d-flex mx-auto mt-1'>
          <Button
            onClick={onPostSubmit}
            color={state.post ? 'primary' : 'default'}
            className='post-button major-button Primary contained p-0 flex-grow-1'>
            {isSubmitting ? (
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

const mapStateToProps = ({ userData , sendFiles, uploads }: any) => ({ userData, sendFile: sendFiles, uploadsProp: uploads });

export default connect(mapStateToProps)(CreatePost);
