import React, { useEffect, useState, useCallback } from 'react';

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

import {
  APIMessageResponse,
  APIConversationResponse
} from '../../constants/interfaces';
import { timestampFormatter, formatMapDateString } from '../../functions/utils';

export interface SelectedMessageValue {
  id: string;
  deleted: boolean;
  type: string;
}

export type ActionChoice = 'DELETE_FOR_ME' | 'CANCEL' | 'DELETE_FOR_EVERYONE';

export const Message = (props: {
  message: APIMessageResponse;
  type: 'incoming' | 'outgoing';
  userId: string;
  className: string;
  shouldUpdate: any;
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
    seen_by,
    _id: id
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

  useEffect(() => {
    if (selected !== null) {
      handleMessageSelection(selected ? String(id) : null, {
        id,
        deleted,
        type
      });
    }
  }, [selected, deleted, id, type, handleMessageSelection]);

  useEffect(() => {
    if (selected !== null && clearSelections) {
      setSelected(false);
      handleMessageSelection(null, { id, deleted, type });
    }
  }, [selected, clearSelections, id, deleted, type, handleMessageSelection]);

  useEffect(
    () => () => {
      setSelected(false);
      handleMessageSelection(null, { id, deleted, type });
    },
    [id, type, deleted, handleMessageSelection]
  );

  return (
    <Container
      className={`${type === 'incoming' ? 'incoming' : 'outgoing'} ${
        selected ? 'selected' : ''
      } msg-container ${className} ${deleted ? 'deleted' : ''} p-0 mx-0`}
      onDoubleClick={handleSelectMessage}
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
    </Container>
  );
};

export const ChatTimestamp = (props: {
  timestamp: number | string;
  chatStatus?: React.ReactFragment;
}) => {
  const { timestamp, chatStatus } = props;

  return (
    <Col as='span' className='chat-timestamp-wrapper p-0'>
      <Col as='span' className='chat-timestamp d-inline-block'>
        {typeof timestamp === 'string'
          ? timestamp
          : timestampFormatter(timestamp)}{' '}
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
    <Box className='chat-date-wrapper text-center my-5' position='relative'>
      <Box component='span' className='chat-date d-inline-block'>
        {formatMapDateString(timestamp, true)}
      </Box>
    </Box>
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
          className='ml-auto my-2 mr-2'>
          Delete for Self
        </Button>
        <Button
          onClick={handleClose('CANCEL')}
          color='primary'
          variant='text'
          className='ml-auto my-2 mr-2'
          autoFocus>
          Cancel
        </Button>
        {canDeleteForEveryone && (
          <Button
            onClick={handleClose('DELETE_FOR_EVERYONE')}
            className='ml-auto my-2 mr-2'
            variant='text'
            color='primary'>
            Delete for All
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
