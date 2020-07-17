import React, { useState, useRef } from 'react';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import Row from 'react-bootstrap/Row';

import { connect } from 'react-redux';

import { PostPropsState } from '../../../../constants';
import { createPost } from '../../../../actions';
import { displayModal } from '../../../../functions';

// import { EditorState } from 'draft-js';
// import createHashtagPlugin from 'draft-js-hashtag-plugin';
// import Editor from 'draft-js-plugins-editor';
// import createMentionPlugin, {
//   defaultSuggestionsFilter
// } from 'draft-js-mention-plugin';
import 'draft-js-mention-plugin/lib/plugin.css';
import { useSubmitPost } from '../../../../hooks/api';

const cookieEnabled = navigator.cookieEnabled;

let token = '';
if (cookieEnabled) {
  token = JSON.parse(localStorage?.kanyimuta ?? '{}')?.token ?? null;
}

// let initialMentions = useFetchMentions('', token);

let userInfo: any = {};
let [avatar, displayName, username] = ['', '', ''];

//you can now use the 'userData' props in state to get userInfo; for this component, you can mapToProps or better still, just pass the value you need to it as props from its parent
if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
  username = userInfo.username;
}

// const mentionPlugin = createMentionPlugin({
//   mentionPrefix: '@'
// });
// const hashtagPlugin = createHashtagPlugin();

const CreatePost = (props: any) => {
  // const { suggestMentions } = props;
  // const results: ColleagueData[] | any[] = suggestMentions.data;
  const [post, setPost] = useState<any>('');
  const [submitPost, postResult, ] = useSubmitPost(post, token);

  // const [ , setEditorState] = useState<any>(
  //   EditorState.createEmpty()
  // );

  // const [, setSuggestions] = useState<
  //   any | undefined
  // >(/*initialMentions*/);

  const editor = useRef<any | null>(null);

  // const { MentionSuggestions } = mentionPlugin;

  // const plugins = [mentionPlugin, hashtagPlugin];

  const onPostChange = (value: any) => {
    setPost({ text: value.target.value });
  };

  // let mentions = [];
  const onPostSubmit = (e: any) => {
    // const text = editor.current.value;

    // send post
    // onPostChange({
    //   text: editor.current.value,
    //   mentions: undefined,
    //   hashtags: undefined
    // });

    console.log(post);

    submitPost().then(() => {
      console.log(postResult);
      displayModal(false);
    });
  };

  // const onSearchChange = ({ value }: any) => {
  //   dispatch(triggerSuggestMentions(value)(dispatch));

  //   if (suggestMentions.status === 'pending') {
  //     setSuggestions([]);
  //   } else if (suggestMentions.status === 'fulfilled') {
  //     if (!results[0]) {
  //       setSuggestions([]);
  //     } else {
  //       let mentions = [];
  //       for (let mention of results) {
  //         mentions.push({
  //           name: mention.username,
  //           link: `/@${mention.username}`,
  //           avatar: '/images/avatar-1.png'
  //         });
  //       }
  //       setSuggestions(defaultSuggestionsFilter(value, mentions));
  //       console.log(mentions);
  //     }
  //   }
  // };

  // const onAddMention = (mention: any) => {
  //   mentions.push(mention.name);
  // };

  const focus = () => {
    editor.current.focus();
  };

  // const onChange = (editorState: any) => {
  //   setEditorState(editorState);
  // };

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
        <div className='editor' onClick={focus} ref={editor}>
          <textarea onChange={onPostChange} />
          {/* <Editor editorState={editorState} onChange={onChange} ref={editor} /> */}
          {/* <MentionSuggestions
            onSearchChange={onSearchChange}
            suggestions={suggestions}
            onAddMention={onAddMention}
          /> */}
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

const mapStateToProps = ({ suggestMentions }: any) => ({ suggestMentions });

export default connect(mapStateToProps, mapDispatchToProps)(CreatePost);
