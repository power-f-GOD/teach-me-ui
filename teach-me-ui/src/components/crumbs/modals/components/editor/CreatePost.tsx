import React, { useState, useRef, Component} from 'react';

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
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin';
import 'draft-js-mention-plugin/lib/plugin.css';
import mentions from './mentions';

let userInfo: any = {};
let [avatar, displayName, username] = ['', '', ''];



//you can now use the 'userData' props in state to get userInfo; for this component, you can mapToProps or better still, just pass the value you need to it as props from its parent
if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
  username = userInfo.username;
}

// message for you ben
// hopefully you will see this
// so when this was not working,
// i created a simple class component,
// it is commented under this whole code
// from the draft-js, they only use class components
// i used dummy text and links in the mentions file cause i had already done this 
// before emmanuel created the end point

const CreatePost = (props: any) => {
  const [post, setPost] = useState<string>('');
  const [editorState, setEditorState] = useState<any>(EditorState.createEmpty());
  const [ suggestions, setSuggestions ] = useState(mentions);
  const editor = useRef<any | null>();

  const mentionPlugin = createMentionPlugin();
  const { MentionSuggestions } = mentionPlugin;

  const plugins = [mentionPlugin];

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

  
  const onSearchChange = ({ value }: any) => {
    setSuggestions(defaultSuggestionsFilter(value, mentions));
  }

  const onAddMention = () => {};

  const focus = () => {
    editor.current.focus();
  };

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
        <div className='editor' onClick={focus}>
        <Editor
          editorState={editorState}
          onChange={onChange}
          // className='compose-message'
          // value={post}
          plugins={plugins}
          ref={editor}
        />
        <MentionSuggestions
          onSearchChange={onSearchChange}
          suggestions={suggestions}
          onAddMention={onAddMention}
        />
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


// export default class SimpleMentionEditor extends Component {
//   mentionPlugin: any;
//   editor: any;

//   constructor(props: any) {
//     super(props);

//     this.mentionPlugin = createMentionPlugin();
//   }

//   state = {
//     editorState: EditorState.createEmpty(),
//     suggestions: mentions,
//   };

//   onChange = (editorState: any) => {
//     this.setState({
//       editorState,
//     });
//   };

//   onSearchChange = ({ value }: any) => {
//     this.setState({
//       suggestions: defaultSuggestionsFilter(value, mentions),
//     });
//   };

//   onAddMention = () => {
//     // get the mention object selected
//   }

//   focus = () => {
//     this.editor.focus();
//   };

//   render() {
//     const { MentionSuggestions } = this.mentionPlugin;
//     const plugins = [this.mentionPlugin];

//     return (
//       <div className='editor' onClick={this.focus}>
//         <Editor
//           editorState={this.state.editorState}
//           onChange={this.onChange}
//           plugins={plugins}
//           ref={(element) => { this.editor = element; }}
//         />
//         <MentionSuggestions
//           onSearchChange={this.onSearchChange}
//           suggestions={this.state.suggestions}
//           onAddMention={this.onAddMention}
//         />
//       </div>
//     );
//   }
// }
