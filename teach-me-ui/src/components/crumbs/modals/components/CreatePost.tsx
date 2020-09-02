import React, { useState, useRef } from 'react';

// import { recursiveUploadReturnsArrayOfId } from '../../../../functions/utils';

import { connect } from 'react-redux';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import AttachmentIcon from '@material-ui/icons/Attachment';

import Row from 'react-bootstrap/Row';

import { PostEditorState, UserData } from '../../../../constants';

import Editor from '../../Editor';

import { useSubmitPost } from '../../../../hooks/api';
import { displayModal } from '../../../../functions';

const CreatePost = (props: { userData: UserData; sendFile: any }) => {
  // const { sendFile } = props;
  const { userData } = props;
  const { avatar, profile_photo, displayName, username } = userData;

  const label = useRef<HTMLLabelElement | any>();

  // const avatarSizes = useStyles()
  const [state, setState] = useState<PostEditorState>({
    mentionsKeyword: '',
    post: '',
    top: 0,
    left: 0,
    showSuggestor: false,
    mentions: [],
    selectedFiles: []
  });
  const [submitPost, , isSubmitting] = useSubmitPost(state.post);

  const onUpdate = (value: string) => {
    setState({
      ...state,
      post: value
    });
  };
  //   const fileSelectedHandler = (e: ChangeEvent<any>) => {
  //     let files: Array<File> = [];
  //     for (let file of e.target.files) {
  //       if (file.size > 50000000) {
  //         label.current.style.display = 'block'
  //         return
  //       files.push(file)
  //       }
  //     }
  //     setState({
  //       ...state,
  //       selectedFiles: e.target.files,
  //       post: {
  //        ...state.post,
  //        media: recursiveUploadReturnsArrayOfId(files)
  //       }
  //     })
  // };

  const onPostSubmit = () => {
    if (state.post) {
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
          <span>{displayName}</span>
          <small>{username}</small>
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
          id={'my-input'}
          style={{ display: 'none' }}
          type={'file'}
        />

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

const mapStateToProps = ({ sendFile, userData }: any) => ({
  sendFile,
  userData
});

export default connect(mapStateToProps)(CreatePost);
