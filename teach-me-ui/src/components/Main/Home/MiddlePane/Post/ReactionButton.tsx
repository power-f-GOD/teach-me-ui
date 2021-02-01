import React from 'react';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import {
  bigNumberFormat,
  emitUserOnlineStatus
} from '../../../../../functions';
import { POST_REACTION } from '../../../../../constants';
import { Reaction } from '../../../../../types';
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
    <>
      <Button
        className={`ReactionButton d-flex px-3 align-items-center reaction-${reaction?.toLowerCase()} ${
          reacted ? 'font-bold' : ''
        }`}
        onClick={reactToPost}>
        <FAIcon
          name={`thumbs-${type === 'UPVOTE' ? 'up' : 'down'}`}
          variant={reacted ? 'solid' : 'outlined'}
          color={!reacted ? '#888' : 'inherit'}
        />
        <Box component='span'>{bigNumberFormat(num_of_reactions)}</Box>
        <Box
          component='span'
          className='desc d-none d-sm-inline d-md-none d-xl-inline'>
          {type === 'UPVOTE' ? 'like' : 'dislike'}
          {num_of_reactions === 1 ? '' : 's'}
        </Box>
      </Button>
    </>
  );
};

export default connect(({ webSocket }: { webSocket: WebSocket }) => ({
  socket: webSocket
}))(ReactionButton);
