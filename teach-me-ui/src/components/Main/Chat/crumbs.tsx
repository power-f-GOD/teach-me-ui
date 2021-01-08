import React, { useEffect, useState, useCallback, useRef } from 'react';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ScheduleIcon from '@material-ui/icons/Schedule';
import BlockIcon from '@material-ui/icons/Block';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import ArrowUpwardIcon from '@material-ui/icons/KeyboardArrowUp';
import ReplyRoundedIcon from '@material-ui/icons/ReplyRounded';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import {
  APIMessageResponse,
  APIConversationResponse
} from '../../../constants/interfaces';
import {
  timestampFormatter,
  formatMapDateString,
  addEventListenerOnce,
  delay,
  interval,
  createObserver,
  dispatch,
  getState
} from '../../../functions/utils';
import { conversation, conversations } from '../../../actions/chat';
import { stickyChatDateRef } from './MiddlePane/ScrollView';
import { messageBoxRef } from './MiddlePane/MessageBox';
import { userDeviceIsMobile } from '../../..';

export interface SelectedMessageValue extends Omit<APIMessageResponse, 'type'> {
  type: 'incoming' | 'outgoing';
  sender_username: string;
}

export const DELETE_FOR_SELF = 'DELETE_FOR_SELF';
export const CANCEL_DELETE = 'CANCEL';
export const DELETE_FOR_ALL = 'DELETE_FOR_ALL';

export type ActionChoice = 'DELETE_FOR_SELF' | 'CANCEL' | 'DELETE_FOR_ALL';

let messageTouchTimeout: any = null;

export const Message = (props: {
  message: APIMessageResponse;
  type: 'incoming' | 'outgoing';
  sender_username: string;
  headSenderUsername: string;
  userId: string;
  className: string;
  forceUpdate: any;
  clearSelections: boolean;
  canSelectByClick: boolean;
  participants: string[];
  scrollView: HTMLElement;
  handleMessageSelection(id: string | null, value: SelectedMessageValue): void;
}) => {
  const {
    type,
    message,
    participants,
    userId,
    sender_username,
    headSenderUsername,
    className,
    clearSelections,
    canSelectByClick,
    scrollView,
    handleMessageSelection
  } = props;
  const {
    message: text,
    date: timestamp,
    deleted,
    delivered_to,
    seen_by,
    parent
  } = message;
  const convoId = message.conversation_id;
  const [selected, setSelected] = useState<boolean | null>(null);
  const messageElRef = React.useRef<HTMLDivElement>(null) as any;

  const handleSelectMessage = useCallback(() => {
    setSelected((prev) => !prev);
  }, []);

  const handleSelectMessageForEnterPress = useCallback(
    (e: any) => {
      if (e.key === 'Enter') handleSelectMessage();
    },
    [handleSelectMessage]
  );

  const handleMessageTouchStart = useCallback(
    (e: any) => {
      if (e.touches && e.touches.length === 1) {
        messageTouchTimeout = setTimeout(() => {
          handleSelectMessage();
        }, 500);
      }
    },
    [handleSelectMessage]
  );

  const handleMessageTouchEnd = useCallback(() => {
    clearTimeout(messageTouchTimeout);
  }, []);

  useEffect(() => {
    const messageEl = messageElRef.current as HTMLElement;

    if (messageEl) {
      ([
        { event: 'dblclick', handler: handleSelectMessage },
        { event: 'touchstart', handler: handleMessageTouchStart },
        { event: 'touchend', handler: handleMessageTouchEnd },
        { event: 'touchmove', handler: handleMessageTouchEnd }
      ] as {
        event: string;
        handler: Function;
      }[]).map(({ event, handler }) => {
        return addEventListenerOnce(messageEl, handler, event, {
          once: false,
          passive: true
        });
      });

      //this is for to add the chat-last-message slide-in animation and reset the conversation new_message prop after the animation has ended;

      if (!/chat-last-message/.test(messageEl.className)) {
        const isNewMessage =
          !!message.timestamp_id ||
          getState().conversation.new_message?.id === message.id;

        // console.log('is last message:', isNewMessage, getState().conversation.new_message);
        if (isNewMessage) {
          messageEl.classList.add('chat-last-message');
        }

        addEventListenerOnce(
          messageEl,
          () => {
            if (isNewMessage) {
              dispatch(conversation(convoId, { new_message: {} }));
              dispatch(
                conversations({
                  data: [{ id: convoId, new_message: {} }]
                })
              );
            }
          },
          'animationend'
        );
      }
    }
  }, [
    userId,
    message.sender_id,
    message.timestamp_id,
    message.id,
    convoId,
    messageElRef,
    handleSelectMessage,
    handleMessageTouchStart,
    handleMessageTouchEnd
  ]);

  useEffect(() => {
    if (selected !== null) {
      handleMessageSelection(selected ? String(message.id) : null, {
        ...message,
        type,
        sender_username
      });
    }
  }, [selected, type, sender_username, message, handleMessageSelection]);

  useEffect(() => {
    if (selected !== null && clearSelections) {
      setSelected(false);
      handleMessageSelection(null, { ...message, type, sender_username });
    }
  }, [
    selected,
    clearSelections,
    sender_username,
    message,
    type,
    handleMessageSelection
  ]);

  useEffect(
    () => () => {
      setSelected(false);
      handleMessageSelection(null, { ...message, type, sender_username });
      messageTouchTimeout = null;
    },
    [type, message, sender_username, handleMessageSelection]
  );

  return (
    <Container
      fluid
      id={`message-${message.id}`}
      className={`${type} ${
        selected ? 'selected' : ''
      } chat-msg-container ${className} fade-in-opacity ${
        deleted ? 'deleted' : ''
      } p-0 mx-0`}
      onKeyUp={handleSelectMessageForEnterPress}
      onClick={canSelectByClick ? handleSelectMessage : undefined}
      tabIndex={0}
      ref={messageElRef}>
      <Col
        as='div'
        className='msg-wrapper scroll-view-msg-wrapper d-inline-flex flex-column justify-content-end'>
        <Box>
          {!deleted && parent && (
            <ChatHead
              head={{
                ...parent,
                sender_username: headSenderUsername,
                type: parent?.sender_id === userId ? 'outgoing' : 'incoming'
              }}
              scrollView={scrollView}
            />
          )}
          {deleted ? (
            <>
              <BlockIcon fontSize='inherit' />
              {type === 'outgoing'
                ? 'You deleted this message'
                : "You can't see this message"}
            </>
          ) : (
            text
          )}
          <ChatTimestamp
            timestamp={timestamp}
            chatStatus={
              <ChatStatus
                type={type}
                isRecent={!!message.pipe}
                userId={userId}
                message={message}
                forceUpdate={`${deleted}${delivered_to?.length}${seen_by?.length}`}
                participants={participants}
              />
            }
          />
        </Box>
      </Col>
    </Container>
  );
};

let headIsVisible = false;

export const ChatHead = (props: {
  head: SelectedMessageValue | null;
  type?: 'reply' | 'head';
  headCopy?: SelectedMessageValue | null;
  setMessageHead?: Function;
  scrollView?: HTMLElement | null;
}) => {
  const { type, head, headCopy, setMessageHead, scrollView } = props;
  const {
    sender_username: senderUsername,
    message: text,
    type: messageType,
    id: messageId
  } = head ?? headCopy ?? {};
  const isReply = type === 'reply';
  const senderIsSelf = messageType === 'outgoing';

  const [headElement, setHeadElement] = useState<HTMLElement | null>();

  const handleCloseReplyMessage = useCallback(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.focus();
    }

    if (setMessageHead) {
      setMessageHead(null);
    }
  }, [setMessageHead]);

  const handleScrollToMessage = useCallback(() => {
    if (!scrollView || !headElement) return;

    headIsVisible = headElement!.getBoundingClientRect().top > 64;

    const observer = createObserver(scrollView, (entries) => {
      const entry = entries[0];
      const target = entry.target;

      headIsVisible = entry.boundingClientRect.top > 64;

      if (headIsVisible) {
        highlightTarget(target);
      }
    });

    observer.observe(headElement);

    if (
      !headIsVisible &&
      !headElement.classList.contains('animate-highlight')
    ) {
      interval(
        () => {
          scrollView.scrollTop -= 150;

          if (headIsVisible) {
            observer.unobserve(headElement);
          }
        },
        16,
        () => headIsVisible
      );
    } else {
      highlightTarget(headElement);
      observer.unobserve(headElement);
    }

    addEventListenerOnce(
      scrollView,
      () => {
        headIsVisible = !headIsVisible;
      },
      'click'
    );

    function highlightTarget(target: Element) {
      target.classList.add('animate-highlight');
      addEventListenerOnce(
        target,
        () => target.classList.remove('animate-highlight'),
        'animationend'
      );
    }
  }, [headElement, scrollView]);

  useEffect(() => {
    setHeadElement(
      scrollView?.querySelector(`#message-${messageId}`) as HTMLElement
    );
  }, [messageId, scrollView]);

  useEffect(() => () => void (headIsVisible = false), []);

  return (
    <Container
      className={`chat-head ${senderIsSelf ? 'self' : 'other'} ${
        isReply ? 'slide-in-top' : ''
      }`}
      onClick={handleScrollToMessage}
      tabIndex={0}>
      <Container
        as='span'
        className='chat-head-sender p-0 d-flex justify-content-start align-items-center'>
        <Container as='span' className='p-0 m-0 w-auto'>
          @{senderUsername}{' '}
        </Container>
        {isReply && <ReplyRoundedIcon fontSize='inherit' />}
      </Container>
      {text}
      {isReply && (
        <IconButton
          className={`close-reply-button  ml-2 ${!head ? 'hide' : ''}`}
          onClick={handleCloseReplyMessage}
          aria-label='close reply button'
          aria-hidden={!head}
          tabIndex={head ? 0 : -1}>
          <CloseIcon />
        </IconButton>
      )}
    </Container>
  );
};

export const ChatTimestamp = (props: {
  className?: string;
  timestamp: number | string;
  chatStatus?: React.ReactFragment;
}) => {
  const { className, timestamp, chatStatus } = props;

  return (
    <Col as='span' className={`chat-timestamp-wrapper p-0`}>
      <Col
        as='span'
        className={`chat-timestamp d-inline-block ${className ?? ''}`}>
        {typeof timestamp === 'string'
          ? timestamp
          : timestampFormatter(timestamp).toLowerCase()}{' '}
        {chatStatus ? chatStatus : ''}
      </Col>
    </Col>
  );
};

export const ChatStatus = (props: {
  type: string;
  isRecent: boolean;
  userId: string;
  forceUpdate: any;
  message: Partial<APIMessageResponse & APIConversationResponse>;
  participants: string[];
}) => {
  const { type, userId, message, participants, isRecent } = props;
  const { timestamp_id, deleted, delivered_to, seen_by } = message ?? {};
  const isDelivered =
    type === 'outgoing' &&
    participants
      ?.filter((id) => id !== userId)
      .every((participant) => delivered_to?.includes(participant));
  const isSeen =
    type === 'outgoing' &&
    participants
      ?.filter((id) => id !== userId)
      .every((participant) => seen_by?.includes(participant));

  const element =
    type !== 'incoming' &&
    !deleted &&
    (timestamp_id ? (
      <ScheduleIcon />
    ) : isSeen || isDelivered ? (
      <DoneAllIcon
        className={`${isSeen ? 'read' : ''} ${isRecent ? 'animate' : ''}`}
      />
    ) : (
      <DoneIcon />
    ));

  return element ? <>{element}</> : <></>;
};

export const ChatDate = ({
  timestamp,
  scrollView
}: {
  timestamp: number;
  scrollView?: HTMLElement;
}) => {
  const dateStamp = formatMapDateString(timestamp, true);
  const chatDateWrapperRef = useRef<HTMLDivElement>(null);
  const chatDateSticky = stickyChatDateRef.current;
  const pxRatio = window.devicePixelRatio;

  const stickDate = useCallback(() => {
    const chatDateWrapper = chatDateWrapperRef.current;

    if (chatDateWrapper) {
      const { top } = (chatDateWrapper as any).getBoundingClientRect();
      const shouldHideSticky = scrollView!.scrollTop < 105 + pxRatio * pxRatio;

      if (top < 65) {
        if (chatDateSticky) {
          chatDateSticky.textContent = dateStamp;
        }

        (chatDateWrapper.children[0] as any).style.opacity = !shouldHideSticky
          ? 0
          : 1;
        chatDateSticky.style.opacity = shouldHideSticky ? 0 : 1;
      } else {
        (chatDateWrapper.children[0] as any).style.opacity = 1;
        chatDateSticky.style.opacity = shouldHideSticky ? 0 : 1;
      }
    }
  }, [dateStamp, chatDateSticky, pxRatio, scrollView]);

  useEffect(() => {
    if (scrollView && chatDateWrapperRef.current && !userDeviceIsMobile) {
      scrollView.addEventListener('scroll', stickDate);
      chatDateSticky.style.opacity =
        scrollView!.scrollTop < 78 + pxRatio ? 0 : 1;
    }

    return () => {
      if (scrollView && !userDeviceIsMobile) {
        scrollView.removeEventListener('scroll', stickDate);
      }
    };
  }, [scrollView, stickDate, timestamp, chatDateSticky, pxRatio]);

  if (isNaN(timestamp)) {
    return <>{timestamp}</>;
  }

  

  return (
    <div
      id={String(timestamp)}
      className='chat-date-wrapper fade-in-opacity text-center mt-4 mb-1'
      ref={chatDateWrapperRef}>
      <Box component='span' className='chat-date d-inline-block'>
        {dateStamp}
      </Box>
    </div>
  );
};

let stickyNewMessageBar: HTMLElement | null;
let relativeNewMessageBar: HTMLElement | null;
let relativeIsVisible = true;

export const NewMessageBar = (props: {
  type: 'relative' | 'sticky';
  convoUnreadCount: number;
  scrollView: HTMLElement;
  shouldRender?: boolean;
  className?: string;
}) => {
  const { convoUnreadCount, scrollView, shouldRender, type, className } = props;

  relativeIsVisible = false;

  const handleStickyClick = useCallback(() => {
    if (!scrollView) return;

    const Button = (scrollView.querySelector(
      '.chat-new-message-bar.relative .chat-new-messages-count'
    ) as any)!;

    const observer = createObserver(scrollView, (entries) => {
      const { top } = entries[0].boundingClientRect;

      relativeIsVisible = top > 64;

      if (Button && relativeIsVisible) {
        Button.classList.add('hide-icon');
      }
    });

    if (relativeNewMessageBar) {
      const { top } = relativeNewMessageBar!.getBoundingClientRect();
      relativeIsVisible = top > 64;

      Button.disabled = relativeIsVisible;
      Button.classList[relativeIsVisible ? 'add' : 'remove']('hide-icon');
      observer[relativeIsVisible ? 'observe' || 'unobserve' : 'observe'](
        relativeNewMessageBar
      );
    }

    addEventListenerOnce(
      scrollView,
      () => {
        relativeIsVisible = !relativeIsVisible;
      },
      'click'
    );

    if (scrollView && !relativeIsVisible) {
      interval(
        () => {
          scrollView.scrollTop -= 100;

          if (relativeNewMessageBar) {
            observer.observe(relativeNewMessageBar);

            if (relativeIsVisible) {
              observer.unobserve(relativeNewMessageBar);
            }
          }
        },
        16,
        () => relativeIsVisible
      );
    }
  }, [scrollView]);

  useEffect(() => {
    if (scrollView) {
      delay(type === 'relative' ? 10 : 125).then(() => {
        stickyNewMessageBar = scrollView?.querySelector(
          '.chat-new-message-bar.sticky'
        ) as HTMLElement;
        relativeNewMessageBar = scrollView?.querySelector(
          '.chat-new-message-bar.relative'
        );

        if (relativeNewMessageBar) {
          //do the next line as animation was part of delay in displaying bar
          relativeNewMessageBar.style.animation = 'scaleY 0s forwards 0s';
          stickyNewMessageBar?.classList.add('d-none');
        } else {
          stickyNewMessageBar?.classList.remove('d-none');
        }

        if (!convoUnreadCount) {
          stickyNewMessageBar?.classList.add('d-none');
        }
      });
    }

    return () => {
      relativeNewMessageBar = null;
      relativeIsVisible = false;
    };
  }, [scrollView, type, convoUnreadCount]);

  if (type === 'sticky' && relativeNewMessageBar) {
    return null;
  }

  if (!convoUnreadCount || !shouldRender) {
    return null;
  }

  return (
    <Container
      className={`chat-new-message-bar ${type} ${className ?? ''} ${
        type === 'sticky' ? 'd-none' : ''
      } p-0`}>
      <Button
        className='chat-new-messages-count btn-primary contained uppercase d-inline-flex align-items-center'
        variant='contained'
        disabled={relativeIsVisible}
        onClick={handleStickyClick}>
        <Container as='span' className='p-0'>
          {convoUnreadCount} new message{convoUnreadCount > 1 ? 's' : ''}{' '}
        </Container>
        {type === 'sticky' && <ArrowUpwardIcon fontSize='small' />}
      </Button>
    </Container>
  );
};

export function ConfirmDialog(props: {
  open: boolean;
  action(choice: ActionChoice): any;
  canDeleteForEveryone: boolean;
  numOfSelectedMessages: number;
}) {
  const {
    open,
    action,
    canDeleteForEveryone,
    numOfSelectedMessages: nMessages
  } = props;

  const handleClose = (choice: ActionChoice) => () => action(choice);
  return (
    <Dialog
      open={open}
      onClose={handleClose('CANCEL')}
      aria-labelledby='alert-dialog-title'>
      <DialogTitle id='alert-dialog-title' className='pb-1'>
        Delete Message{nMessages > 1 ? 's' : ''}?
      </DialogTitle>
      <DialogContent className='theme-tertiary-lighter'>
        Sure you want to do this?
      </DialogContent>
      <DialogActions className='text-right d-flex flex-column'>
        <Button
          onClick={handleClose(DELETE_FOR_SELF)}
          color='primary'
          variant='text'
          className='ml-auto mb-2 mt-1 mr-2 btn-secondary uppercase'>
          Delete for Self
        </Button>
        <Button
          onClick={handleClose(CANCEL_DELETE)}
          color='primary'
          variant='text'
          className='ml-auto mb-2 mr-2 btn-secondary uppercase'
          autoFocus>
          Cancel
        </Button>
        {canDeleteForEveryone && (
          <Button
            onClick={handleClose(DELETE_FOR_ALL)}
            className='ml-auto mb-2 mr-2 btn-secondary uppercase'
            variant='text'
            color='primary'>
            Delete for All
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
