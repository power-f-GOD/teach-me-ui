import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// import Grid from '@material-ui/core/Grid';
// import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ChatIcon from '@material-ui/icons/Chat';
import MinimizeIcon from '@material-ui/icons/Minimize';
import CloseIcon from '@material-ui/icons/Close';
import EmojiIcon from '@material-ui/icons/Mood';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
// import Badge from '@material-ui/core/Badge';

const messageBox = React.createRef<HTMLInputElement>();

const ChatBox = () => {
  const [scrollViewElevation, setScrollViewElevation] = React.useState(String);
  const handleMessageInputChange = React.useCallback((e: any) => {
    let elevation = e.target.offsetHeight;
    let rem = elevation > 57 ? 1 : 1.25;

    e.persist();
    window.setTimeout(() => {
      setScrollViewElevation(
        `calc(${e.target.offsetHeight}px - ${rem}rem)`
      );
    }, 6);
  }, []);

  return (
    <Container className='ChatBox p-0'>
      <Container className='chat-box-container'>
        <Row as='section' className='chat-box-wrapper flex-column debugger'>
          <Col as='section' className='chat-header d-flex p-0'>
            <Col as='span' className='colleague-name'>
             <Avatar className='chat-avatar mr-2' alt="Emmanuel Sunday" src="/images/emmanuel.png" /> Emmanuel Sunday
            </Col>
            <Col as='section' className='controls p-0'>
              <Col xs={6} as='span' className='minimize-wrapper'>
                <IconButton
                  // edge='start'
                  className='minimize-button'
                  // onClick={toggleDrawer(true)}
                  aria-label='minimize chat box'>
                  <MinimizeIcon fontSize='inherit' />
                </IconButton>
              </Col>
              <Col xs={6} as='span' className='close-wrapper'>
                <IconButton
                  // edge='start'
                  className='close-button'
                  // onClick={toggleDrawer(true)}
                  aria-label='close chat box'>
                  <CloseIcon fontSize='inherit' />
                </IconButton>
              </Col>
            </Col>
          </Col>
          <Col as='section'
            className='chat-scroll-view'
            style={{ marginBottom: scrollViewElevation }}>
            <IncomingMessage />
            <IncomingMessage />
            <IncomingMessage />
            <IncomingMessage />
            <IncomingMessage />
            <IncomingMessage />
          </Col>
          <Col as='section' className='chat-message-box d-flex p-0'>
            <Col as='span' className='emoji-wrapper p-0'>
              <IconButton
                // edge='start'
                className='emoji-button'
                // onClick={toggleDrawer(true)}
                aria-label='insert emoji'>
                <EmojiIcon fontSize='inherit' />
              </IconButton>
            </Col>
            <Col className='message-box-wrapper p-0'>
              <TextField
                variant='outlined'
                id='message-box'
                className='message-box'
                // label='Ty'
                placeholder='Type a message...'
                multiline
                rows={1}
                rowsMax={6}
                size='small'
                inputRef={messageBox}
                fullWidth
                inputProps={{
                  onKeyUp: handleMessageInputChange
                }}
                // onChange={}
              />
            </Col>
            <Col as='span' className='send-wrapper p-0'>
              <IconButton
                // edge='start'
                className='send-button'
                // onClick={toggleDrawer(true)}
                aria-label='send message'>
                <SendIcon fontSize='inherit' />
              </IconButton>
            </Col>
          </Col>
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

function IncomingMessage() {
  return (
    <Col
      as='div'
      className='incoming-message-wrapper d-flex flex-column justify-content-end p-0'>
      <Col as='span' className='incoming-message d-block'>
        Lorem ipsum dolor anticidunct efler dist dejour flerm turis dot evendour
        intellisus res pundo letus adoliva.
      </Col>
      <Col as='span' className='chat-timestamp d-inline-block'>
        07:56am
      </Col>
    </Col>
  );
}

export default ChatBox;
