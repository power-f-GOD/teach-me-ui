import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// import Box from '@material-ui/core/Box';
// import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ChatIcon from '@material-ui/icons/Chat';

const ChatBox = () => {
  return (
    <Container className='ChatBox p-0'>
      <Container className='chat-box-container'>
        <Row className='chat-box-wrapper'>
          <Col className='chat-header'>Godspower</Col>
          <Col className='chat-scroll-view'></Col>
          <Col className='chat-message-box'></Col>
        </Row>
        <IconButton
          // edge='start'
          className='chat-button'
          // onClick={toggleDrawer(true)}
          aria-label='chat'>
          <ChatIcon fontSize='inherit' />
        </IconButton>
      </Container>
    </Container>
  );
};

export default ChatBox;
