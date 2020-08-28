import React, { useState, useRef, ChangeEvent, MouseEvent } from 'react';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import InputTrigger from 'react-input-trigger';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {
  getMentionsFromText,
  getHashtagsFromText,
  formatDate,
  dispatch
} from '../../../../functions';

import { connect } from 'react-redux';

import { makeRepost } from '../../../../actions';

import { useStyles, PostEditorState } from '../../../../constants';

// import {
// //   useSubmitPost
//   /*useGetFormattedMentionsWithKeyword*/
// } from '../../../../hooks/api';

let userInfo: any = {};
let [avatar, displayName, username] = ['', '', ''];

//you can now use the 'userData' props in state to get userInfo; for this component, you can mapToProps or better still, just pass the value you need to it as props from its parent
if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
  username = userInfo.username;
}

const CreatePost: React.FC<any> = (props) => {
  const avatarSizes = useStyles();
  const [state, setState] = useState<PostEditorState>({
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
  });
  // const getMentions = useGetFormattedMentionsWithKeyword(state.mentionsKeyword)[0];

  const editor = useRef<HTMLTextAreaElement | any>();

  const toggleSuggestor = (metaInformation: any) => {
    const { hookType, cursor } = metaInformation;

    if (hookType === 'start') {
      setState({
        ...state,
        showSuggestor: true,
        left: cursor.left,

        // we need to add the cursor height so that the dropdown doesn't overlap with the `@`.
        top: Number(cursor.top) + Number(cursor.height)
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
    }
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

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const post = e.target.value;
    setState({
      ...state,
      post: {
        text: post,
        mentions: getMentionsFromText(post),
        hashtags: getHashtagsFromText(post)
      }
    });
  };

  const onPostSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    dispatch(
      makeRepost({
        pipe: 'POST_REPOST',
        text: state.post.text,
        post_id: props.id
      })
    );
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
        <div id='suggestion-container'>
          <InputTrigger
            trigger={{
              keyCode: 50,
              shiftKey: true
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
              rows={5}
              id='post-input'
              onChange={(e: any) => {
                onChange(e);
              }}
              placeholder={`What's on your mind, ${displayName.split(' ')[0]}`}
              ref={editor}></textarea>
          </InputTrigger>
          <div
            id='suggestor-dropdown'
            style={{
              display: state.showSuggestor ? 'block' : 'none',
              top: state.top || 0,
              left: state.left || 0
            }}>
            {state.mentions?.map((mention: any, key: number) => (
              <div
                key={key}
                style={{
                  padding: '10px 20px'
                }}>
                <Avatar
                  className={avatarSizes.small}
                  component='span'
                  src={`${mention.avatar}`}
                />
                {mention.name}
              </div>
            ))}
          </div>
        </div>
        <Box
          className='quoted-post mx-auto'
          //   onClick={navigate(props.parent?.id as string)}
        >
          <Row className='container-fluid px-2 mx-auto p-0 align-items-center'>
            <Avatar
              component='span'
              className='post-avatar'
              alt={props.sender_name}
              src={`/images/${props.userAvatar}`}
            />
            <Col className='d-flex flex-grow-1 flex-column'>
              <Box component='div' fontWeight='bold'>
                {props.sender_name}
              </Box>
              <Box component='div' color='#777'>
                @{props.sender_username}
              </Box>
            </Col>
          </Row>
          <Row className='container-fluid  mx-auto'>
            <Box component='div' pt={1} px={0} className='break-word'>
              {/* {processPostFn(props.parent?.text as string)} */}
              {props.text as string}
            </Box>
            <Box
              component='small'
              textAlign='right'
              width='100%'
              color='#888'
              pt={1}>
              {formatDate(props.posted_at as number)}
            </Box>
          </Row>
        </Box>
        <Row className='d-flex mx-auto mt-1'>
          <Button
            onClick={onPostSubmit}
            color={'primary'}
            className='post-button p-0 flex-grow-1'>
            {props.makeRepostStatus.status === 'pending' ? (
              <CircularProgress size={28} color='inherit' />
            ) : (
              `Repost${state.post.text ? ' with comment' : ''}`
            )}
          </Button>
        </Row>
      </form>
    </Box>
  );
};

const mapStateToProps = (state: any) => ({
  makeRepostStatus: state.makeRepostStatus
});

export default connect(mapStateToProps)(CreatePost);
