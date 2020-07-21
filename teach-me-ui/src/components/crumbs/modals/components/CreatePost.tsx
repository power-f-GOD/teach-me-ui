import React, { useState, useRef } from 'react';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import Row from 'react-bootstrap/Row';

import { 
  displayModal, 
  getMentionsFromText, 
  getHashtagsFromText 
} from '../../../../functions';

import { EditorState, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import Editor from 'draft-js-plugins-editor';
import 'draft-js-mention-plugin/lib/plugin.css';
import createHashtagPlugin from 'draft-js-hashtag-plugin';
import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin';

import { useSubmitPost, useGetFormattedMentionsWithKeyword} from '../../../../hooks/api';

let userInfo: any = {};
let [avatar, displayName, username] = ['', '', ''];

//you can now use the 'userData' props in state to get userInfo; for this component, you can mapToProps or better still, just pass the value you need to it as props from its parent
if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
  username = userInfo.username;
}

const mentionPlugin = createMentionPlugin({
  mentionPrefix: '@'
});
const hashtagPlugin = createHashtagPlugin();

const CreatePost = (props: any) => {


  const [mentionsKeyword, setMentionsKeyword] = useState<any>('');
  const [post, setPost] = useState<any>('');
  const [getMentions, ] = useGetFormattedMentionsWithKeyword(mentionsKeyword);
  const [submitPost, , isSubmitting] = useSubmitPost(post);

  const [editorState, setEditorState] = useState<any>(
    EditorState.createEmpty()
  );

  const [suggestions, setSuggestions] = useState<any>([]);

  const editor = useRef<any>();
  
  const onPostChange = (post: string) => {
    setPost({ text: post, mentions: getMentionsFromText(post), hashtags: getHashtagsFromText(post)});
  };

  const onChange = (editorState: any) => {
    const blocks = convertToRaw(editorState.getCurrentContent()).blocks;
    const value = blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n');
    setEditorState(editorState);
    onPostChange(value);
  }
  
  const onPostSubmit = (e: any) => {
    if (textInFirstBlockInEditor) {
      submitPost().then((data: any) => {
        if (!isSubmitting) {
          console.log(data);
          displayModal(false);
        }
      });
    }
  };
    
  const onSearchChange = async ({ value }: any) => {
    setMentionsKeyword(value)
    console.log(value, 'mentionskeyword')
    getMentions().then((mentions: any[] | undefined) => {
      console.log(mentions);
      setSuggestions(defaultSuggestionsFilter(value, mentions));
    });
  };
    
  const focus = () => {
    editor.current.focus();
  };
      
  const { MentionSuggestions } = mentionPlugin;
  const plugins = [mentionPlugin, hashtagPlugin];
  let textInFirstBlockInEditor = (convertToRaw(editorState.getCurrentContent()).blocks)[0].text.length;
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
        <div 
          className='editor' 
          onClick={focus} 
          ref={editor}
        >
          <Editor 
            placeholder={`What's on your mind, ${displayName.split(' ')[0]}?`}
            editorState={editorState} 
            onChange={onChange} 
            plugins={plugins}
            ref={editor} 
          />
          <MentionSuggestions
            onSearchChange={onSearchChange}
            suggestions={suggestions}
          />
        </div>
        <Row className='d-flex mx-auto mt-1'>
          <Button
            onLoad={focus}
            onClick={onPostSubmit}
            color={textInFirstBlockInEditor
              ? 'primary' 
              : 'default'
            }
            className='post-button p-0 flex-grow-1'>
            {
              isSubmitting 
              ? <CircularProgress size={28} color='inherit'/> 
              : 'Post'
            }
          </Button>
        </Row>
      </form>
    </Box>
  );
};


export default CreatePost;
