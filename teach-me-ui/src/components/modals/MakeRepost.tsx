import React, { useState, MouseEvent } from 'react';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {
  getCharacterSequenceFromText,
  formatDate,
  dispatch,
  displayModal
} from '../../functions';

import Loader from '../shared/Loaders';

import Editor from '../crumbs/Editor';

import { connect } from 'react-redux';

import { makeRepostRequest } from '../../actions';


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

  const onUpdate = (value: string) => {
    const post = value.trim();

    setState({
      ...state,
      post: {
        ...state.post,
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
      makeRepostRequest({
        pipe: 'POST_REPOST',
        text: state.post.text,
        post_id: props.id
      })
    );
  };

  return (
    <Box className='repost' p={1} pt={0}>
      <Row className='container-fluid p-0 mx-auto mb-2'>
        <Box pr={1}>
          <Avatar
            component='span'
            className='chat-avatar compose-avatar'
            alt={userData.displayName}
            src={userData.profile_photo ? userData.profile_photo : ''}
          />
        </Box>
        <div className='d-flex flex-column justify-content-center flex-grow-1'>
          <span className='font-bold'>{userData.displayName}</span>
          <small>@{userData.username}</small>
        </div>
      </Row>
      <form>
        <Editor onUpdate={onUpdate} />
        <Box className='quoted-post mx-auto'>
          <Row className='container-fluid px-2 mx-auto p-0 align-items-center'>
            <Avatar
              component='span'
              className='post-avatar'
              alt={props.sender_name}
              src={`/images/${props.userAvatar}`}
            />
            <Col className='d-flex flex-grow-1 flex-column names'>
              <Box component='div' fontWeight='bold'>
                {props.sender.first_name} {' '} {props.sender.last_name}
                <Box component='span' color='#777' className='username'>
                  @{props.sender.username}
                </Box>
              </Box>
              <Box
                component='small'
                color='#888'>
                {formatDate(props.date as number)}
              </Box>
            </Col>
          </Row>
          <Row className='container-fluid  mx-auto'>
            <Box component='div' pt={1} px={0} className='break-word'>
              {/* {processPostFn(props.parent?.text as string)} */}
              {props.text as string}
            </Box>
          </Row>
        </Box>
        <Row className='d-flex mx-auto mt-1'>
          <Button
            disabled={props.makeRepost.status === 'pending'}
            onClick={onPostSubmit}
            color={'primary'}
            className='post-button major-button Primary contained p-0 flex-grow-1'>
            {props.makeRepost.status === 'pending' ? (
              <>
                Reposting{' '}
                <Loader
                  type='ellipsis'
                  inline={true}
                  color='#555'
                  size={6}
                  className='ml-2'
                />
              </>
            ) : (
              `Repost${state.post.text ? ' with comment' : ''}`
            )}
          </Button>
        </Row>
      </form>
    </Box>
  );
};

const mapStateToProps = ({ makeRepost, userData }: any) => ({
  makeRepost,
  userData
});

export default connect(mapStateToProps)(MakePost);

