import React, { useState, useRef, ChangeEvent, MouseEvent } from 'react';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {
  getCharacterSequenceFromText,
  formatDate,
  dispatch,
  displayModal
} from '../../functions';

import { connect } from 'react-redux';

import { makeRepost } from '../../actions';


const MakePost: React.FC<any> = (props) => {
  const { userData } = props;
  const [state, setState] = useState<any>({
    post: {
      text: '',
      mentions: [],
      hashtags: [],
      media: []
    },
  });

  const editor = useRef<HTMLTextAreaElement | any>();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const post = e.target.value;
    setState({
      ...state,
      post: {
        text: post,
        mentions: getCharacterSequenceFromText(post, '@'),
        hashtags: getCharacterSequenceFromText(post, '#')
      }
    });
  };

  const removeModal = () => {
    displayModal(false, true);
  }

  const closeModal = (e: any) => {
    if (String(window.location.hash)  === '') removeModal();
  }

  window.onhashchange = closeModal;

  setTimeout(() => {
    window.location.hash = 'modal';
  }, 0);

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
          alt={userData.displayName}
          src={userData.profile_photo ? userData.profile_photo : `images/${userData.avatar}`}
        />
        <div className='d-flex flex-column justify-content-center flex-grow-1'>
          <span>{userData.displayName}</span>
          <small>{userData.username}</small>
        </div>
      </Row>
      <form>
        <div id='suggestion-container'>
          <textarea
            className='create-repost-textarea mt-1'
            autoFocus
            rows={10}
            id='post-input'
            onChange={(e: any) => {
              onChange(e);
            }}
            placeholder={`What's on your mind, ${userData.displayName.split(' ')[0]}`}
            ref={editor}>
          </textarea>
        </div>
        <Box className='quoted-post mx-auto'>
          <Row className='container-fluid px-2 mx-auto p-0 align-items-center'>
            <Avatar
              component='span'
              className='post-avatar'
              alt={props.sender_name}
              src={`/images/${props.userAvatar}`}
            />
            <Col className='d-flex flex-grow-1 flex-column'>
              <Box component='div' fontWeight='bold'>
                {props.sender.first_name} {' '} {props.sender.last_name}
              </Box>
              <Box component='div' color='#777'>
                @{props.sender.username}
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
              {formatDate(props.date as number)}
            </Box>
          </Row>
        </Box>
        <Row className='d-flex mx-auto mt-1'>
          <Button
            onClick={onPostSubmit}
            color={'primary'}
            className='post-button major-button Primary contained p-0 flex-grow-1'>
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

const mapStateToProps = ({ makeRepostStatus, userData }: any) => ({
  makeRepostStatus,
  userData
});

export default connect(mapStateToProps)(MakePost);
