import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  createRef
} from 'react';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

import EmojiIcon from '@material-ui/icons/Mood';
import SendIcon from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';

import { APIMessageResponse } from '../../../../types';
import { userDeviceIsMobile } from '../../../..';
import {
  conversationMessages,
  conversation
} from '../../../../actions/main/chat';
import {
  dispatch,
  delay,
  preventEnterNewLine,
  emitUserOnlineStatus
} from '../../../../utils';
import { CHAT_TYPING } from '../../../../constants/chat';
import { SelectedMessageValue, ChatHead } from '../crumbs';
import { scrollView } from './ScrollView';

export const messageBoxRef: any = createRef<HTMLInputElement | null>();
export let messageBox: HTMLInputElement | null = null;

let messageDrafts: any = {};
let messageHeadCopy: SelectedMessageValue | null = null;

const MessageBox = (props: {
  convoId: string;
  messageHead: SelectedMessageValue | null;
  webSocket: WebSocket;
  setMessageHead: Function;
}) => {
  const { convoId, webSocket: socket, messageHead, setMessageHead } = props;
  const cid = window.location.pathname.split('/').slice(-1)[0];
  const msgBoxInitHeight = 19;

  const chatHeadWrapperRef: any = useRef<HTMLElement | null>();
  const [msgBoxRowsMax, setMsgBoxRowsMax] = useState<number>(1);

  const handleSendMsgClick = useCallback(() => {
    const msgBox = messageBoxRef.current!;
    const msg = {
      message: msgBox.value.trim(),
      timestamp_id: String(Date.now()),
      pipe: 'CHAT_NEW_MESSAGE',
      date: Date.now(),
      conversation_id: convoId,
      id: 'ddd'
    } as APIMessageResponse;

    msgBox.focus();

    if (!msg.message) {
      setMsgBoxRowsMax(msgBoxRowsMax < 5 ? msgBoxRowsMax + 1 : msgBoxRowsMax);
      return;
    }

    try {
      const online = navigator.onLine;

      if (online && socket && socket.readyState === 1) {
        if (messageHead) {
          setMessageHead(null);
        }

        dispatch(
          conversationMessages({
            data: [
              {
                ...msg,
                parent: (messageHead ? { ...messageHead } : null) as any
              }
            ]
          })
        );
        msgBox.value = '';
        setMsgBoxRowsMax(1);
        delete messageDrafts[convoId];
        socket.send(JSON.stringify({ ...msg, parent: messageHead?.id }));
        dispatch(conversation(convoId, { unread_count: 0 }));
        delay(50).then(() => {
          scrollView!.scrollTop = scrollView!.scrollHeight;
        });
      } else {
        emitUserOnlineStatus(online, !online, {
          open: true,
          message: online
            ? "Something went wrong. Seems you are/were offline. We'll try to reconnect then you can try again."
            : null,
          severity: 'info',
          autoHide: false
        });
      }
    } catch (e) {
      emitUserOnlineStatus(false, true, {
        open: true,
        message:
          e + 'An error occurred. Could not establish connection with server.',
        severity: 'error'
      });
    }
  }, [messageHead, setMessageHead, msgBoxRowsMax, convoId, socket]);

  const handleMsgInputChange = useCallback(
    (e: any) => {
      const value = e.target.value.trim();

      messageDrafts[convoId as string] = value;

      if (
        socket &&
        socket.readyState === 1 &&
        !/Tab|Arrow|Shift|Meta|Control|Alt/i.test(e?.key) &&
        !e.ctrlKey &&
        !e.metaKey &&
        value
      ) {
        socket.send(
          JSON.stringify({ conversation_id: convoId, pipe: CHAT_TYPING })
        );
      }

      if (e.key === 'Enter') {
        if (
          (!e.shiftKey && !userDeviceIsMobile) ||
          (e.shiftKey && userDeviceIsMobile)
        ) {
          handleSendMsgClick();
          return false;
        }
      }

      if (e.target.scrollHeight > msgBoxInitHeight) {
        setMsgBoxRowsMax(msgBoxRowsMax < 7 ? msgBoxRowsMax + 1 : msgBoxRowsMax);
      }

      if (
        scrollView &&
        scrollView.scrollTop + scrollView.offsetHeight + 50 >=
          scrollView.scrollHeight - 100
      ) {
        delay(0).then(() => {
          if (scrollView) {
            scrollView.scrollTop = scrollView.scrollHeight;
          }
        });
      }
    },
    [socket, convoId, msgBoxRowsMax, handleSendMsgClick]
  );

  useEffect(() => {
    const chatHeadWrapper = chatHeadWrapperRef.current as HTMLElement;

    // scrollView = scrollViewRef.current!;

    if (chatHeadWrapper) {
      const chatHead = chatHeadWrapper.querySelector(
        '.chat-head'
      ) as HTMLElement;

      chatHeadWrapper.style.height = `${
        messageHead ? chatHead.offsetHeight + 4 : 0
      }px`;

      delay(350).then(() => {
        messageHeadCopy = (messageHead ? { ...messageHead } : null) as any;
      });
    }

    if (!messageBox) {
      messageBox = messageBoxRef.current!;
    }
  }, [messageHead]);

  useEffect(() => {
    if (convoId) {
      setMessageHead(null);
    }

    if ((cid || convoId) && messageBoxRef.current) {
      messageBoxRef.current.value = messageDrafts[convoId || cid] ?? '';

      if (!userDeviceIsMobile) {
        messageBoxRef.current.focus();
      }
    }

    return () => {
      messageHeadCopy = null;
      messageDrafts = {};
    };
  }, [convoId, setMessageHead, cid]);

  return (
    <Col
      as='section'
      className={`chat-msg-box ${messageHead ? 'open-reply' : ''} px-0`}>
      <Container className='chat-head-wrapper p-0 m-0' ref={chatHeadWrapperRef}>
        <ChatHead
          type='reply'
          head={messageHead}
          headCopy={messageHeadCopy}
          setMessageHead={setMessageHead}
        />
      </Container>
      <Container className='d-flex p-0'>
        <Col as='span' className='chat-emoji-wrapper p-0'>
          <IconButton
            className='emoji-button d-none'
            // onClick={toggleDrawer(true)}
            aria-label='insert emoji'>
            <EmojiIcon fontSize='inherit' />
          </IconButton>
        </Col>
        <Col className='chat-msg-textfield-wrapper p-0'>
          <TextField
            variant='outlined'
            id='chat-msg-textfield'
            className='chat-msg-textfield custom-scroll-bar grey-scrollbar'
            placeholder='Type a message...'
            multiline
            rows={1}
            rowsMax={msgBoxRowsMax}
            size='small'
            inputRef={messageBoxRef}
            fullWidth
            inputProps={{
              onKeyDown: handleMsgInputChange,
              onKeyUp: handleMsgInputChange,
              onKeyPress: preventEnterNewLine,
              onInput: handleMsgInputChange
            }}
          />
        </Col>
        <Col as='span' className='chat-send-wrapper p-0'>
          <IconButton
            className='send-button'
            onClick={handleSendMsgClick}
            aria-label='send msg'>
            <SendIcon fontSize='inherit' />
          </IconButton>
        </Col>
      </Container>
    </Col>
  );
};

export default MessageBox;
