import React, { useState } from 'react';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import Row from 'react-bootstrap/Row';

import { connect } from 'react-redux';

import { PostPropsState } from '../../../constants';
import { createPost } from '../../../actions';
import { displayModal } from '../../../functions';

let userInfo: any = {};
let [avatar, displayName, username] = ['', '', ''];

//you can now use the 'userData' props in state to get userInfo; for this component, you can mapToProps or better still, just pass the value you need to it as props from its parent
if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
  username = userInfo.username;
}

const CreatePost = (props: any) => {
  const [post, setPost] = useState<string>('');

  const onPostChange = (e: any) => {
    setPost(e.target.value);
  };

  const onPostSubmit = (e: any) => {
    const postData: PostPropsState = {
      displayName: displayName,
      userAvatar: avatar,
      downvotes: 0,
      postBody: post,
      noOfComments: 0,
      upvotes: 0,
      reaction: 'neutral',
      username: username
    };
    props.addPost(postData);
    displayModal(false);
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
        </div>
      </Row>
      <form>
        <div>
          <textarea
            autoFocus
            className='compose-message'
            onChange={onPostChange}
            value={post}
            placeholder="What's on your mind?"
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
