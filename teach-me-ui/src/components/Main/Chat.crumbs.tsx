import React, { useEffect, useState, useCallback } from 'react';

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

import {
  APIMessageResponse,
  APIConversationResponse
} from '../../constants/interfaces';
import { timestampFormatter, formatMapDateString } from '../../functions/utils';

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
    <Box
      className={`${type === 'incoming' ? 'incoming' : 'outgoing'} ${
        selected ? 'selected' : ''
      } msg-container ${className} ${deleted ? 'deleted' : ''} p-0 mx-0`}
      onDoubleClick={handleSelectMessage}
      onTouchStart={handleMessageTouchStart}
      onTouchEnd={handleMessageTouchEnd}
      onTouchMove={handleMessageTouchEnd}
      onKeyUp={handleSelectMessageForEnterPress}
      tabIndex={0}
      onClick={canSelectByClick ? handleSelectMessage : undefined}>
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
    </Box>
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

export const ChatDate = ({ timestamp }: { timestamp: number }) => {
  if (isNaN(timestamp)) {
    return <>{timestamp}</>;
  }

  return (
    <div className='chat-date-wrapper text-center my-5'>
      <Box component='span' className='chat-date d-inline-block'>
        {formatMapDateString(timestamp, true)}
      </Box>
    </div>
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
