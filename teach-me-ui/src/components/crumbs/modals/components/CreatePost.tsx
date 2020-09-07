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

import { PostEditorState, UserData } from '../../../../constants';

import { sendFilesToServer } from '../../../../actions';

import Editor from '../../Editor';

import { useSubmitPost } from '../../../../hooks/api';
import { displayModal } from '../../../../functions';

const CreatePost = (props: { userData: UserData; sendFiles: any }) => {
  const { userData, sendFiles } = props;
  const { avatar, profile_photo, displayName } = userData;
  const label = useRef<HTMLLabelElement | any>();

  const [state, setState] = useState<PostEditorState>({
    mentionsKeyword: '',
    post: {
      text: ''
    },
    mentions: [],
  });

  const [submitPost, , isSubmitting] = useSubmitPost({...state.post, media:sendFiles.payload});

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

  const preview = (files: File[]) => {
    for (let file of files) {
      if (isImage(file)) {
        let img = document.createElement('img');
        let reader = new FileReader();
        reader.onload = (e) => {
          img.setAttribute('src', e.target!.result as string);
        }
        reader.readAsDataURL(file)
        img.style.height = '100px';
        img.style.width = '100px';
        (prev.current as HTMLDivElement).appendChild(img)
      } else {
        let div = document.createElement('div');
        let text = document.createTextNode(`${file.name}`)
        div.appendChild(text);
        div.style.width = '100px';
        div.style.height = '100px';
        div.style.fontSize = '1.5em';
        div.style.backgroundColor = '#ccc';
        div.style.borderRadius = '3px';

        (prev.current as HTMLDivElement).appendChild(div)
      }
    }
  }

  const fileSelectedHandler = (e: ChangeEvent<any>) => {
    let files: Array<File> = [];
    for (let file of e.target.files) {
      if (file.size > 50000000) {
        label.current.style.display = 'block'
        return
      } else {
        files.push(file)
      }
    }
    preview(files);
    sendFilesToServer(files)
  };
  
 
  const onPostSubmit = () => {
    if (state.post.text) {
      submitPost().then(() => {
        if (!isSubmitting) {
          displayModal(false);
        }
      });
    }
  };

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
          <AttachmentIcon />
        </label>
        <label
          htmlFor='my-input'
          ref={label}
          style={{ color: 'red', fontSize: 'small', display: 'none' }}>
          files should be maximum of 50mb
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
            ) : (
              'Post'
            )}
          </Button>
        </Row>
      </form>
    </Box>
  );
};

const mapStateToProps = ({ userData , sendFiles}: any) => ({ userData, sendFiles });

export default connect(mapStateToProps)(CreatePost);
