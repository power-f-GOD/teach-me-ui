import React, { useState, useRef } from 'react';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import Row from 'react-bootstrap/Row';

import { connect } from 'react-redux';

import { PostPropsState } from '../../../../../constants';
import { createPost } from '../../../../../actions';
import { displayModal } from '../../../../../functions'; 

import { convertToRaw, EditorState, RichUtils } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import mentions from './mentions';

let userInfo: any = {};
let [avatar, displayName, username] = ['', '', ''];

const mentionPlugin = createMentionPlugin();
const { MentionSuggestions } = mentionPlugin;

//you can now use the 'userData' props in state to get userInfo; for this component, you can mapToProps or better still, just pass the value you need to it as props from its parent
if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
  username = userInfo.username;
}

const CreatePost = (props: any) => {
  const [post, setPost] = useState<string>('');
  const [editorState, setEditorState] = useState<any>('');
  const editor = useRef<any | null>();


  const onPostChange = (e: any) => {
    setPost(e.current.value);
  };

  const onPostSubmit = (e: any) => {
    // send post
    onPostChange(editor);
    displayModal(false);
  };

  const onChange = (editorState: any) => {
    setEditorState(editorState);
  };

  const handleKeyCommand = ( command: any, editorState: any ) => {
    let newState;
    newState = RichUtils.handleKeyCommand( editorState, command );
    if ( newState ) {
      onChange(newState);
      return 'handled';
    }
    return 'non-handled';
  };

  const [ suggestions, setSuggestions ] = useState();
  const onSearchChange = ({ value }: any) => {
    setSuggestions(defaultSuggestionsFilter(value, mentions));
  }


  return (
    <Box p={1} pt={0}>
      <Row className='container-fluid p-0 mx-auto'>
        <Avatar
          component='span'
          className='chat-avatar compose-avatar'
          alt={displayName}
          src={`/images/${avatar}`}
        />
        <div className='d-flex flex-column justify-content-center flex-grow-1'>
          <span>{displayName}</span>
          <small>{username}</small>
        </div>
      </Row>
      <form>
        <div>
          <Editor
            editorState={editorState}
            ref={editor}
            autoFocus
            className='compose-message'
            onChange={onChange}
            // value={post}
            placeholder="What's on your mind?"
          />
          <MentionSuggestions
            onSearchChange={onSearchChange}
        </div>
        <Row className='d-flex mx-auto mt-1'>
          <Button
            onClick={onPostSubmit}
            color={post.length > 0 ? 'primary' : 'default'}
            className='post-button p-0 flex-grow-1'>
            Post
          </Button>
        </Row>
      </form>
    </Box>
  );
};



const mapDispatchToProps = (dispatch: Function) => ({
  addPost(post: PostPropsState) {
    dispatch(createPost(post));
  }
});

export default connect(undefined, mapDispatchToProps)(CreatePost);
