import React, { useState, useCallback, useEffect, createRef } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Grid from '@material-ui/core/Grid';
// import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ChatIcon from '@material-ui/icons/Chat';
import WebAssetIcon from '@material-ui/icons/WebAsset';
import CloseIcon from '@material-ui/icons/Close';
import EmojiIcon from '@material-ui/icons/Mood';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';

import { timestampFormatter } from '../../functions';

interface Message {
  type: 'incoming' | 'outgoing';
  text: string;
  timestamp: string;
}

const msgBoxRef = createRef<HTMLInputElement>();
const scrollViewRef = createRef<HTMLElement>();
// const msgBoxMaxRow = 6;
const msgBoxInitHeight = 19;

const ChatBox = () => {
  const [scrollView, setScrollView] = useState<HTMLElement | null>(null);
  const [scrollViewElevation, setScrollViewElevation] = React.useState(String);
  const [minimizeChatBox, setMinimizeChatBox] = useState<boolean>(false);
  const [closeChatBox, setCloseChatBox] = useState<boolean>(true);
  const [msgBoxCurrentHeight, setMsgBoxCurrentHeight] = useState<number>(
    msgBoxInitHeight
  );
  const [msgBoxRowsMax, setMsgBoxRowsMax] = useState<number>(1);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleMinimizeChatClick = useCallback(() => {
    setMinimizeChatBox((prevState: boolean) => !prevState);

    if (window.innerWidth < 768) {
      if (!minimizeChatBox) {
        document.body.style.overflow = 'auto';
      } else {
        document.body.style.overflow = 'hidden';
      }
    }
  }, [minimizeChatBox]);

  const handleCloseChatClick = useCallback(() => {
    setCloseChatBox(true);
    document.body.style.overflow = 'auto';
  }, []);

  const handleOpenChatClick = useCallback(() => {
    setCloseChatBox(false);

    if (window.innerWidth < 768 && !minimizeChatBox) {
      document.body.style.overflow = 'hidden';
    }
  }, [minimizeChatBox]);

  const handleSendMsgClick = useCallback(() => {
    const msgBox = msgBoxRef.current!;
    const timestamp = timestampFormatter();
    const msg: Message = {
      type: 'outgoing',
      text: msgBox.value.trim(),
      timestamp
    };

    if (!msg.text) {
      setMsgBoxRowsMax(msgBoxRowsMax < 6 ? msgBoxRowsMax + 1 : msgBoxRowsMax);
      return;
    }

    msgBox.value = '';
    setMsgBoxRowsMax(1);
    setMessages((prevState: Message[]) => {
      const newMessages = [...prevState];

      newMessages.push(msg);
      return newMessages;
    });
    setScrollViewElevation('calc(19px - 1.25rem)');

    window.setTimeout(() => {
      const timestamp = timestampFormatter();
      const msg: Message = {
        type: 'incoming',
        text:
          'A sample response from the end user via the server (web socket)...',
        timestamp
      };

      setMessages((prevState: Message[]) => {
        const newMessages = [...prevState];

        newMessages.push(msg);
        return newMessages;
      });
    }, 2000);
  }, [msgBoxRowsMax]);

  const handleMsgInputChange = useCallback(
    (e: any) => {
      if (!e.shiftKey && e.key === 'Enter') {
        handleSendMsgClick();
        return;
      } else if (
        (e.shiftKey && e.key === 'Enter') ||
        e.target.scrollHeight > msgBoxInitHeight
      ) {
        setMsgBoxRowsMax(msgBoxRowsMax < 6 ? msgBoxRowsMax + 1 : msgBoxRowsMax);
      }

      const scrollView = scrollViewRef.current!;
      const elevation = e.target.offsetHeight;
      const chatBoxMaxHeight = msgBoxInitHeight * msgBoxRowsMax;
      const remValue = elevation > msgBoxInitHeight * 4 ? 1.25 : 1.25;

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
    [msgBoxCurrentHeight, msgBoxRowsMax, handleSendMsgClick]
  );

  useEffect(() => {
    setScrollView(scrollViewRef.current);

    if (scrollView) {
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [scrollView]);

  useEffect(() => {
    if (messages && scrollView) {
      scrollView.scrollTop = scrollView.scrollHeight;
    }
  }, [messages, scrollView]);

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
            <Col as='span' className='controls p-0'>
              <Col xs={6} as='span' className='minimize-wrapper'>
                <IconButton
                  // edge='start'
                  className='minimize-button'
                  onClick={handleMinimizeChatClick}
                  aria-label='minimize chat box'>
                  {!minimizeChatBox ? (
                    <Col as='span' className='minimize-icon'>
                      ─
                    </Col>
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
            className='chat-scroll-view custom-scroll-bar d-flex flex-column col'
            style={{ marginBottom: scrollViewElevation }}
            ref={scrollViewRef}>
            {!!messages[0] ? (
              messages.map((message, key: number) =>
                message.type === 'incoming' ? (
                  <IncomingMsg message={message} key={key} />
                ) : (
                  <OutgoingMsg message={message} key={key} />
                )
              )
            ) : (
              <Col className='theme-tertiary-lighter d-flex align-items-center justify-content-center'>
                Start a new conversation.
              </Col>
            )}
          </Grid>
          <Col as='section' className='chat-msg-box d-flex p-0'>
            <Col as='span' className='emoji-wrapper p-0'>
              <IconButton
                // edge='start'
                className='emoji-button'
                // onClick={toggleDrawer(true)}
                aria-label='insert emoji'>
                <EmojiIcon fontSize='inherit' />
              </IconButton>
            </Col>
            <Col className='msg-box-wrapper p-0'>
              <TextField
                variant='outlined'
                id='msg-box'
                className='msg-box custom-scroll-bar'
                placeholder='Type a message...'
                multiline
                rows={1}
                rowsMax={msgBoxRowsMax}
                size='small'
                inputRef={msgBoxRef}
                fullWidth
                inputProps={{
                  onKeyUp: handleMsgInputChange
                }}
                // onChange={}
              />
            </Col>
            <Col as='span' className='send-wrapper p-0'>
              <IconButton
                // edge='start'
                className='send-button'
                onClick={handleSendMsgClick}
                aria-label='send msg'>
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

function IncomingMsg(props: { message: Message } | any) {
  const { text, timestamp } = props.message;

  return (
    <Container className='incoming-msg-container p-0 m-0'>
      <Col
        as='div'
        className='incoming-msg-wrapper scroll-view-msg-wrapper d-inline-flex flex-column justify-content-end p-0'>
        <Col as='span' className='scroll-view-msg d-block'>
          {text}
        </Col>
        <Col as='span' className='chat-timestamp-wrapper d-block p-0'>
          <Col as='span' className='chat-timestamp d-inline-block m-0'>
            {timestamp}
          </Col>
        </Col>
      </Col>
    </Container>
  );
}

function OutgoingMsg(props: { message: Message } | any) {
  const { text, timestamp } = props.message;

  return (
    <Container className='outgoing-msg-container p-0 m-0'>
      <Col
        as='div'
        className='outgoing-msg-wrapper scroll-view-msg-wrapper d-inline-flex flex-column justify-content-end p-0'>
        <Col as='span' className='scroll-view-msg d-block'>
          {text}
        </Col>
        <Col as='span' className='chat-timestamp-wrapper d-block p-0'>
          <Col as='span' className='chat-timestamp d-inline-block m-0'>
            {timestamp}
          </Col>
        </Col>
      </Col>
    </Container>
  );
}

export default ChatBox;
