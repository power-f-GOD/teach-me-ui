import React, { useState, useCallback, useEffect, createRef } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Grid from '@material-ui/core/Grid';
// import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ChatIcon from '@material-ui/icons/Chat';
import MinimizeIcon from '@material-ui/icons/Minimize';
// import MaximizeIcon from '@material-ui/icons/Maximize';
import WebAssetIcon from '@material-ui/icons/WebAsset';
import CloseIcon from '@material-ui/icons/Close';
import EmojiIcon from '@material-ui/icons/Mood';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';

const msgBoxRef = createRef<HTMLInputElement>();
const scrollViewRef = createRef<HTMLElement>();
const msgBoxMaxRow = 6;
const msgBoxInitHeight = 19;

const ChatBox = () => {
  const [scrollView, setScrollView] = useState<HTMLElement | null>(null);
  const [scrollViewElevation, setScrollViewElevation] = React.useState(String);
  const [minimizeChatBox, setMinimizeChatBox] = useState<boolean>(false);
  const [closeChatBox, setCloseChatBox] = useState<boolean>(true);
  const [msgBoxCurrentHeight, setMsgBoxCurrentHeight] = useState<number>(
    msgBoxInitHeight
  );
  const handleMinimizeChatClick = useCallback(() => {
    setMinimizeChatBox((prevState: boolean) => !prevState);
  }, []);
  const handleCloseChatClick = useCallback(() => {
    setCloseChatBox(true);
  }, []);
  const handleOpenChatClick = useCallback(() => {
    setCloseChatBox(false);
  }, []);
  const handleMessageInputChange = useCallback(
    (e: any) => {
      const scrollView = scrollViewRef.current!;
      const elevation = e.target.offsetHeight;
      const chatBoxMaxHeight = msgBoxInitHeight * msgBoxMaxRow;
      const remValue = elevation > msgBoxInitHeight * 4 ? 1 : 1.25;

      if (elevation <= chatBoxMaxHeight) {
        if (elevation > msgBoxCurrentHeight) {
          //makes sure right amount of scrollTop is set when scrollView scroll position is at the very bottom
          window.setTimeout(() => {
            if (
              scrollView.scrollHeight -
                scrollView.offsetHeight -
                msgBoxInitHeight * 2 <=
              scrollView.scrollTop
            ) {
              scrollView.scrollTop += 19;
            }
          }, 200);
          scrollView.scrollTop += 19;
        } else if (elevation < msgBoxCurrentHeight) {
          scrollView.scrollTop -= 19;
        }
      }

      setScrollViewElevation(`calc(${elevation}px - ${remValue}rem)`);
      setMsgBoxCurrentHeight(elevation);
    },
    [msgBoxCurrentHeight]
  );

  useEffect(() => {
    setScrollView(scrollViewRef.current);

    if (scrollView) {
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [scrollView]);

  return (
    <Container className='ChatBox p-0'>
      <Container className='chat-box-container'>
        <Row
          as='section'
          className={`chat-box-wrapper flex-column ${
            minimizeChatBox ? 'minimized' : ''
          } ${closeChatBox ? 'closed' : ''} debugger`}>
          <Col as='section' className='chat-header d-flex p-0'>
            <Col as='span' className='colleague-name'>
              <Badge
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
                color='primary'
                badgeContent={4}
                overlap='circle'
                variant='dot'>
                <Avatar
                  className='chat-avatar mr-2'
                  alt='Emmanuel Sunday'
                  src='/images/emmanuel.png'
                />
              </Badge>{' '}
              Emmanuel Sunday
            </Col>
            <Col as='section' className='controls p-0'>
              <Col xs={6} as='span' className='minimize-wrapper'>
                <IconButton
                  // edge='start'
                  className='minimize-button'
                  onClick={handleMinimizeChatClick}
                  aria-label='minimize chat box'>
                  {!minimizeChatBox ? (
                    <MinimizeIcon fontSize='inherit' />
                  ) : (
                    <WebAssetIcon fontSize='inherit' />
                  )}
                </IconButton>
              </Col>
              <Col xs={6} as='span' className='close-wrapper'>
                <IconButton
                  // edge='start'
                  className='close-button'
                  onClick={handleCloseChatClick}
                  aria-label='close chat box'>
                  <CloseIcon fontSize='inherit' />
                </IconButton>
              </Col>
            </Col>
          </Col>
          <Grid
            component='section'
            className='chat-scroll-view d-flex flex-column col'
            style={{ marginBottom: scrollViewElevation }}
            ref={scrollViewRef}>
            <IncomingMessage />
            <IncomingMessage />
            <IncomingMessage />
            <OutgoingMessage />
            <OutgoingMessage />
            <IncomingMessage />
            <OutgoingMessage />
            <IncomingMessage />
            <IncomingMessage />
            <OutgoingMessage />
          </Grid>
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
                placeholder='Type a message...'
                multiline
                rows={1}
                rowsMax={msgBoxMaxRow}
                size='small'
                inputRef={msgBoxRef}
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
          className={`chat-button ${closeChatBox ? '' : 'hide'}`}
          onClick={handleOpenChatClick}
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
      className='incoming-message-wrapper scroll-view-message-wrapper d-flex flex-column justify-content-end p-0'>
      <Col as='span' className='scroll-view-message d-block'>
        Lorem ipsum dolor anticidunct efler dist dejour flerm turis.
      </Col>
      <Col as='span' className='chat-timestamp d-inline-block'>
        07:56am
      </Col>
    </Col>
  );
}

function OutgoingMessage() {
  return (
    <Col
      as='div'
      className='outgoing-message-wrapper scroll-view-message-wrapper d-flex flex-column justify-content-end p-0'>
      <Col as='span' className='scroll-view-message d-block'>
        Lorem ipsum dolor anticidunct intellisus res pundo letus adoliva.
      </Col>
      <Col as='span' className='chat-timestamp d-inline-block'>
        07:56am
      </Col>
    </Col>
  );
}

export default ChatBox;
