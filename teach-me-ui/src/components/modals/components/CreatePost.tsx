import React from 'react';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

let userInfo: any = {};
let [avatar, displayName] = ['', ''];

if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
}

const CreatePost = () => {
  return (
    <>
      <Row className='container-fluid p-0 mx-auto'>
        <Col xs={1}>
          <Avatar
            component='span'
            className='chat-avatar compose-avatar'
            alt={displayName}
            src={`/images/${avatar}`}
          />
        </Col>
        <Col xs={11}>
          <Box
            className='compose-message'
            component='textarea'
            fontSize='14px'
            fontWeight='bold'
            width='100%'
            height='250px'
            color='#555'
            placeholder="What's on your mind?"
          />
        </Col>
      </Row>
      <Row className='d-flex mx-auto mt-2 justify-content-end'>
        <Button color='primary'>POST</Button>
      </Row>
    </>
  );
};

export default CreatePost;
