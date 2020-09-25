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
import ArrowUpwardIcon from '@material-ui/icons/KeyboardArrowUp';

import {
  APIMessageResponse,
  APIConversationResponse
} from '../../constants/interfaces';
import {
  timestampFormatter,
  formatMapDateString,
  addEventListenerOnce,
  delay,
  interval
} from '../../functions/utils';
import { chatDateStickyRef } from './Chat.MiddlePane';

export interface SelectedMessageValue extends Omit<APIMessageResponse, 'type'> {
  type: 'incoming' | 'outgoing';
  sender_username: string;
}

export type ActionChoice = 'DELETE_FOR_ME' | 'CANCEL' | 'DELETE_FOR_EVERYONE';

let messageTouchTimeout: any = null;

export const Message = (props: {
  message: APIMessageResponse;
  type: 'incoming' | 'outgoing';
  sender_username: string;
  userId: string;
  className: string;
  forceUpdate: any;
  clearSelections: boolean;
  canSelectByClick: boolean;
  participants: string[];
  handleMessageSelection(id: string | null, value: SelectedMessageValue): void;
}) => {
  const {
    type,
    message,
    participants,
    userId,
    sender_username,
    className,
    clearSelections,
    canSelectByClick,
    handleMessageSelection
  } = props;
  const {
    message: text,
    date: timestamp,
    deleted,
    delivered_to,
    seen_by
  } = message;
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

  const handleMessageTouchStart = useCallback(() => {
    messageTouchTimeout = setTimeout(() => {
      handleSelectMessage();
    }, 500);
  }, [handleSelectMessage]);

  const handleMessageTouchEnd = useCallback(() => {
    clearTimeout(messageTouchTimeout);
  }, []);

  useEffect(() => {
    const messageEl = messageElRef.current;

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
    }
  }, [
    messageElRef,
    handleSelectMessage,
    handleMessageTouchStart,
    handleMessageTouchEnd
  ]);

  useEffect(() => {
    if (selected !== null) {
      handleMessageSelection(selected ? String(message._id) : null, {
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
    },
    [type, message, sender_username, handleMessageSelection]
  );

  return (
    <Container
      fluid
      className={`${type === 'incoming' ? 'incoming' : 'outgoing'} ${
        selected ? 'selected' : ''
      } msg-container ${className} ${deleted ? 'deleted' : ''} p-0 mx-0`}
      onKeyUp={handleSelectMessageForEnterPress}
      onClick={canSelectByClick ? handleSelectMessage : undefined}
      tabIndex={0}
      ref={messageElRef}>
      <Col
        as='div'
        className='msg-wrapper scroll-view-msg-wrapper d-inline-flex flex-column justify-content-end'>
        <Box>
          {deleted ? (
            type === 'outgoing' ? (
              <>
                <BlockIcon fontSize='inherit' /> You deleted this message
              </>
            ) : (
              <>
                <BlockIcon fontSize='inherit' /> You can't see this message
              </>
            )
          ) : (
            text
          )}
          <ChatTimestamp
            timestamp={timestamp}
            chatStatus={
              <ChatStatus
                type={type}
                userId={userId}
                message={message}
                shouldUpdate={
                  '' + deleted + delivered_to?.length + seen_by?.length
                }
                participants={participants}
              />
            }
          />
        </Box>
      </Col>
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
  userId: string;
  shouldUpdate: any;
  message: Partial<APIMessageResponse & APIConversationResponse>;
  participants: string[];
}) => {
  const { type, userId, message, participants } = props;
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
      <DoneAllIcon className={isSeen ? 'read' : ''} />
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
  const chatDateSticky = chatDateStickyRef.current;
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
    if (scrollView && chatDateWrapperRef.current) {
      scrollView.addEventListener('scroll', stickDate);
      chatDateSticky.style.opacity =
        scrollView!.scrollTop < 78 + pxRatio ? 0 : 1;
    }

    return () => {
      if (scrollView) {
        scrollView.removeEventListener('scroll', stickDate);
      }
    };
  }, [scrollView, stickDate, timestamp, chatDateSticky.style.opacity, pxRatio]);

  if (isNaN(timestamp)) {
    return <>{timestamp}</>;
  }

  return (
    <div
      id={String(timestamp)}
      className='chat-date-wrapper text-center mt-5 mb-4'
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
      '.new-messages-bar.relative .new-messages-count'
    ) as any)!;

    if (relativeNewMessageBar) {
      relativeIsVisible =
        relativeNewMessageBar!.getBoundingClientRect().top > 64;

      Button.disabled = relativeIsVisible;
      Button.classList[relativeIsVisible ? 'add' : 'remove']('hide-icon');
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
            delay(25).then(() => {
              relativeIsVisible =
                relativeNewMessageBar!.getBoundingClientRect().top > 64;

              if (Button && relativeIsVisible) {
                Button.classList.add('hide-icon');
              }
            });
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
          '.new-messages-bar.sticky'
        ) as HTMLElement;
        relativeNewMessageBar = scrollView?.querySelector(
          '.new-messages-bar.relative'
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
    <Container className={`new-messages-bar ${type} ${className ?? ''}`}>
      <Button
        className='new-messages-count btn-primary contained uppercase d-inline-flex align-items-center'
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

export default function ConfirmDialog(props: {
  open: boolean;
  action(choice: ActionChoice): any;
  canDeleteForEveryone: boolean;
}) {
  const { open, action, canDeleteForEveryone } = props;

  const handleClose = (choice: ActionChoice) => () => action(choice);
  return (
    <Dialog
      open={open}
      onClose={handleClose('CANCEL')}
      aria-labelledby='alert-dialog-title'>
      <DialogTitle id='alert-dialog-title'>Delete Message?</DialogTitle>
      <DialogActions
        className='text-right d-flex flex-column'
        style={{ minWidth: '19rem' }}>
        <Button
          onClick={handleClose('DELETE_FOR_ME')}
          color='primary'
          variant='text'
          className='ml-auto my-2 mr-2 btn-secondary uppercase'>
          Delete for Self
        </Button>
        <Button
          onClick={handleClose('CANCEL')}
          color='primary'
          variant='text'
          className='ml-auto my-2 mr-2 btn-secondary uppercase'
          autoFocus>
          Cancel
        </Button>
        {canDeleteForEveryone && (
          <Button
            onClick={handleClose('DELETE_FOR_EVERYONE')}
            className='ml-auto my-2 mr-2 btn-secondary uppercase'
            variant='text'
            color='primary'>
            Delete for All
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
