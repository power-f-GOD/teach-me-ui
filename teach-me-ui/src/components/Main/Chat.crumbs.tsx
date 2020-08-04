import React, { useEffect, useState, useCallback } from 'react';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ScheduleIcon from '@material-ui/icons/Schedule';

import { APIMessageResponse, Partial } from '../../constants/interfaces';
import {
  timestampFormatter,
  dateStringMapFormatter
} from '../../functions/utils';

export const Message = (props: {
  message: Partial<APIMessageResponse>;
  type: 'incoming' | 'outgoing';
  userId: string;
  className: string;
  deleted: boolean;
  clearSelections: boolean;
  participants: string[];
  handleMessageSelection: Function;
}) => {
  const {
    type,
    message,
    participants,
    userId,
    className,
    clearSelections,
    deleted,
    handleMessageSelection
  } = props;
  const {
    message: text,
    date,
    timestamp_id,
    delivered_to,
    seen_by,
    _id: id
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

  const handleMessageDblClick = useCallback(
    (e: any) => {
      if (type === 'incoming') return;
      setSelected((prev) => !prev);
    },
    [type]
  );

  useEffect(() => {
    if (type === 'outgoing' && selected !== null) {
      handleMessageSelection(selected ? id : null, id);
    }
  }, [selected, id, type, handleMessageSelection]);

  useEffect(() => {
    if (type === 'outgoing' && selected !== null && clearSelections) {
      setSelected(false);
      handleMessageSelection(null, id);
    }
  }, [selected, clearSelections, id, type, handleMessageSelection]);

  useEffect(
    () => () => {
      if (type === 'outgoing') {
        setSelected(false);
        handleMessageSelection(null, id);
      }
    },
    [id, type, handleMessageSelection]
  );

  return (
    <Container
      className={`${type === 'incoming' ? 'incoming' : 'outgoing'} ${
        selected ? 'selected' : ''
      } msg-container ${className} ${deleted ? 'deleted' : ''} p-0 mx-0`}
      onDoubleClick={deleted ? undefined : handleMessageDblClick}>
      <Col
        as='div'
        className='msg-wrapper scroll-view-msg-wrapper d-inline-flex flex-column justify-content-end'>
        <Box>
          {deleted
            ? type === 'outgoing'
              ? 'You deleted this message'
              : 'User changed mind about this message'
            : text}
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
