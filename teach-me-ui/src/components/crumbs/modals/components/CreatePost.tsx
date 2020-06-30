import React from 'react';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import Row from 'react-bootstrap/Row';

let userInfo: any = {};
let [avatar, displayName] = ['', ''];

//you can now use the 'userData' props in state to get userInfo; for this component, you can mapToProps or better still, just pass the value you need to it as props from its parent
if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
}

const CreatePost = () => {
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
      <div>
        <Box
          className='compose-message'
          component='textarea'
          fontSize='14px'
          fontWeight='bold'
          width='100%'
          height='250px'
          color='black'
          placeholder="What's on your mind?"
        />
      </div>
      <Row className='d-flex mx-auto mt-1'>
        <Button color='primary' className='post-button flex-grow-1'>
          Post
        </Button>
      </Row>
    </Box>
  );
};

export default CreatePost;
