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
import Tooltip from '@material-ui/core/Tooltip';

import Row from 'react-bootstrap/Row';

import { PostEditorState, UserData } from '../../../../constants';

import { sendFilesToServer, sendFiles } from '../../../../actions';

import Editor from '../../Editor';

import { useSubmitPost } from '../../../../hooks/api';
import { displayModal, dispatch } from '../../../../functions';

const CreatePost = (props: { userData: UserData; sendFile: any }) => {
  const { userData, sendFile } = props;
  const { avatar, profile_photo, displayName } = userData;
  const label = useRef<HTMLLabelElement | any>();
  const label1 = useRef<HTMLLabelElement | any>();

  const [state, setState] = useState<PostEditorState>({
    mentionsKeyword: '',
    post: {
      text: ''
    },
    selectedFiles: []
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

  const isImage = (file: File) => {
    return file['type'].split('/')[0] === 'image';
  }

  const removeFile = (e: any) => {
    console.log(state.selectedFiles);
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

  const preview = (files: File[]) => {
    for (let file of files) {
      let div = document.createElement('div');
      let button = document.createElement('button');
      let cancelText = document.createTextNode('x');
      button.appendChild(cancelText);
      div.classList.add('col-4', 'div-wrapper');
      button.setAttribute('type', 'button');
      button.classList.add('remove-img-btn', 'rounded-circle');
      button.onclick = removeFile;
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

  

  const fileSelectedHandler = (e: ChangeEvent<any>) => {
    label.current.style.display = 'none';
    label1.current.style.display = 'none';
    let selectedFiles = state.selectedFiles;
    let files: Array<File> = [];
    for (let file of e.target.files) {
      if (file.size > 50000000) {
        files = [];
        label.current.style.display = 'block';
        return;
      } else {
        if (selectedFiles.length >= 5) {
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
      if (state.selectedFiles[0]) {
        sendFilesToServer(state.selectedFiles, submitPost, displayModal)
      } else {
        submitPost().then(() => {
          if (!isSubmitting) {
            displayModal(false);
          }
        });
      }
    }
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
        <label htmlFor='my-input'>
          <Tooltip title='add files' placement='top-start'>
            <AttachmentIcon style={{cursor: 'pointer'}}/>
          </Tooltip>
        </label>
        <label
          htmlFor='my-input'
          ref={label}
          style={{ color: 'red', fontSize: 'small', display: 'none' }}>
          files should be maximum of 50mb
        </label>
        <label
          htmlFor='my-input'
          ref={label1}
          style={{ color: 'red', fontSize: 'small', display: 'none'}}>
          You can upload a maximum of five files, only first five files were selected
        </label>
        <input
          multiple={true}
          id='my-input'
          onChange={fileSelectedHandler}
          style={{ display: 'none' }}
          type={'file'}
        />
        <Row className='d-flex mx-auto mt-1'>
          <div ref={prev} style={{display: 'flex', flexWrap :'wrap'}}>
            
          </div>
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

const mapStateToProps = ({ userData , sendFiles}: any) => ({ userData, sendFile: sendFiles });

export default connect(mapStateToProps)(CreatePost);
