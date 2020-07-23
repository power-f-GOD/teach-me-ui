import React, { useState, useRef } from 'react';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import InputTrigger from 'react-input-trigger';

import Row from 'react-bootstrap/Row';

import { 
  displayModal, 
  getMentionsFromText, 
  getHashtagsFromText 
} from '../../../../functions';

import { useStyles } from '../../../../constants';
import { useSubmitPost/*, useGetFormattedMentionsWithKeyword*/} from '../../../../hooks/api';

let userInfo: any = {};
let [avatar, displayName, username] = ['', '', ''];

//you can now use the 'userData' props in state to get userInfo; for this component, you can mapToProps or better still, just pass the value you need to it as props from its parent
if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
  username = userInfo.username;
}

const CreatePost = (props: any) => {

  const avatarSizes = useStyles()
  const [state, setState] = useState<any>({
    mentionsKeyword: '',
    post: {
      text: '',
      mentions: [],
      hashtags: []
    },
    top: 0,
    left: 0,
    showSuggestor: false,
    mentions: []

  })
  // const getMentions = useGetFormattedMentionsWithKeyword(state.mentionsKeyword)[0];
  const [submitPost, , isSubmitting] = useSubmitPost(state.post);

  const editor = useRef<any>()

  const toggleSuggestor = (metaInformation: any) => {
    const { hookType, cursor } = metaInformation;

    if (hookType === 'start') {
      setState({
        ...state,
        showSuggestor: true,
        left: cursor.left,

        // we need to add the cursor height so that the dropdown doesn't overlap with the `@`.
        top: (Number(cursor.top) + Number(cursor.height))
      });

    }
      
    if (hookType === 'cancel') {
      // reset the state
      
      setState({
        ...state,
        showSuggestor: false,
        left: 0,

        // we need to add the cursor height so that the dropdown doesn't overlap with the `@`.
        top: 0
      });
    };
  };

  // const handleMentionInput = (metaInformation: any) => {

  //   setState({
  //     mentionsKeyword: metaInformation.text
  //   });

  //   getMentions().then((data: any[]) => {
  //     setState({ 
  //       ...state,
  //       mentions: data
  //     });
  //   });
  // } 

  const onChange = (e: any) => {
    const post = e.target.value;
    setState({
      ...state,
      post: { 
        text: post, 
        mentions: getMentionsFromText(post), 
        hashtags: getHashtagsFromText(post)
      }
    });
  }
  
  const onPostSubmit = (e: any) => {
    if (state.post.text) {
      submitPost().then((data: any) => {
        if (!isSubmitting) {
          displayModal(false);
        }
      });
    }
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
      <div
        id='suggestion-container'
      >
        <InputTrigger
          trigger={{
            keyCode: 50,
            shiftKey: true,
          }}
          onStart={(metaData: any) => {
            toggleSuggestor(metaData);
          }}
          onCancel={(metaData: any) => {
            toggleSuggestor(metaData);
          }}
          // onType={(metaData: any) => { 
          //   handleMentionInput(metaData); 
          // }}
        >
          <textarea 
            autoFocus
            rows={9}
            id="post-input" 
            onChange={(e: any) => {
              onChange(e)
            }}
            placeholder={`What's on your mind, ${displayName.split(' ')[0]}`}
            ref={editor}
          >
          </textarea>
        </InputTrigger>
        <div
          id="suggestor-dropdown"
          style={{
            display: state.showSuggestor ? "block" : "none",
            top: state.top || 0,
            left: state.left || 0,
          }}
        >
          {
            state.mentions?.map((mention: any, key: number) => (
              <div
                key={key}
                style={{
                  padding: '10px 20px'
                }}  
              >
                <Avatar
                  className={avatarSizes.small}
                  component='span'
                  src={`${mention.avatar}`}
                />
                { mention.name }
              </div>
            ))  
          }
        </div>
      </div>
        <Row className='d-flex mx-auto mt-1'>
          <Button
            onClick={onPostSubmit}
            color={state.post.text
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
