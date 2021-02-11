import React, { useState, MouseEvent } from 'react';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import Row from 'react-bootstrap/Row';

import { getCharacterSequenceFromText, dispatch } from '../../functions';

import Loader from '../shared/Loaders';

import Editor from '../crumbs/Editor';

import { connect } from 'react-redux';

import { makeRepostRequest } from '../../actions';

import QuotedPost from '../Main/Home/MiddlePane/Post/QuotedPost';

import { POST_REPOST } from '../../constants';

const MakeRePost: React.FC<any> = (props) => {
  const { userData } = props;
  const [state, setState] = useState<any>({
    post: {
      text: '',
      mentions: [],
      hashtags: [],
      media: []
    }
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

  const onPostSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    dispatch(
      makeRepostRequest({
        pipe: POST_REPOST,
        text: state.post.text,
        post_id: props.post.id
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
        <QuotedPost head {...props.post} />
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
              `Make${state.post.text ? ' with Comment' : ''}`
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

export default connect(mapStateToProps)(MakeRePost);
