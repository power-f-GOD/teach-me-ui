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

import { APIMessageResponse } from '../../constants/interfaces';
import {
  timestampFormatter,
  dateStringMapFormatter
} from '../../functions/utils';

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
    date,
    timestamp_id,
    delivered_to,
    seen_by,
    _id: id,
    deleted
  } = message;
  const timestamp = timestampFormatter(date);
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

  const [selected, setSelected] = useState<boolean | null>(null);

  const handleSelectMessage = useCallback((e: any) => {
    setSelected((prev) => !prev);
  }, []);

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
                <BlockIcon fontSize='inherit' /> User thought to delete message
              </>
            )
          ) : (
            text
          )}
          <Col as='span' className='chat-timestamp-wrapper p-0'>
            <Col as='span' className='chat-timestamp d-inline-block'>
              {timestamp}{' '}
              {type !== 'incoming' &&
                !deleted &&
                (timestamp_id ? (
                  <ScheduleIcon />
                ) : isSeen || isDelivered ? (
                  <DoneAllIcon className={isSeen ? 'read' : ''} />
                ) : (
                  <DoneIcon />
                ))}
            </Col>
          </Col>
        </Box>
      </Col>
    </Container>
  );
};

export const ChatDate = ({
  timestamp,
  sentToday,
  sentYesterday
}: {
  timestamp: number;
  sentToday: boolean;
  sentYesterday: boolean;
}) => {
  if (isNaN(timestamp)) {
    return <>{timestamp}</>;
  }

  return (
    <Box className='chat-date-wrapper text-center my-4' position='relative'>
      <Box component='span' className='chat-date d-inline-block'>
        {sentToday
          ? 'Today'
          : sentYesterday
          ? 'Yesterday'
          : dateStringMapFormatter(timestamp, true)}
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
          Delete For Self
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
            Delete For All
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
