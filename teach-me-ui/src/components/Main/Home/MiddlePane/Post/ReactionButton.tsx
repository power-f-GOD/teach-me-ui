import React from 'react';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import {
  bigNumberFormat,
  emitUserOnlineStatus
} from '../../../../../functions';
import { POST_REACTION, Reaction } from '../../../../../constants';
import { FAIcon } from '../../../../shared/Icons';

interface ReactButtonPropsState {
  id: string;
  num_of_reactions: number;
  type: 'UPVOTE' | 'DOWNVOTE';
  reaction: Reaction | null;
  socket?: WebSocket;
}

export const ReactionButton: React.FunctionComponent<ReactButtonPropsState> = (
  props
) => {
  const { type, id, reaction, num_of_reactions, socket } = props;
  const reacted = /upvote|downvote/i.test(reaction || '');

  const reactToPost = React.useCallback(() => {
    if (socket && socket.readyState === socket.OPEN) {
      socket.send(
        JSON.stringify({
          pipe: POST_REACTION,
          post_id: id,
          reaction: reacted ? 'NEUTRAL' : type
        })
      );
    } else {
      emitUserOnlineStatus(true, !navigator.onLine, {
        open: true,
        message:
          "Something went wrong. Seems you are/were offline. We'll try to reconnect then you can try again.",
        severity: 'info',
        autoHide: false
      });
    }
  }, [socket, id, type, reacted]);

  return (
    <Button
      className={`ReactionButton d-flex align-items-center reaction-${reaction?.toLowerCase()}`}
      onClick={reactToPost}>
      <FAIcon
        className={`fa-thumbs-${type === 'UPVOTE' ? 'up' : 'down'}`}
        variant={reacted ? 'solid' : 'outlined'}
        color={!reacted ? '#888' : 'inherit'}
      />
      <Box>{bigNumberFormat(num_of_reactions)}</Box>
    </Button>
  );
};

export default connect(({ webSocket }: any) => ({ socket: webSocket }))(
  ReactionButton
);
