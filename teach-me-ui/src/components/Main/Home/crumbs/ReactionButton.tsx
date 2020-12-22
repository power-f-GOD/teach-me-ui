import React from 'react';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import UpvoteSharpIcon from '@material-ui/icons/ExpandLessSharp';
import DownvoteSharpIcon from '@material-ui/icons/ExpandMoreSharp';
import Button from '@material-ui/core/Button';

import { bigNumberFormat, emitUserOnlineStatus } from '../../../../functions';
import { POST_REACTION, Reaction } from '../../../../constants';

interface ReactButtonPropsState {
  id: string;
  num_of_reactions: number;
  type: 'UPVOTE' | 'DOWNVOTE';
  reaction: Reaction | null;
  socket?: WebSocket;
}

export const ReactButton: React.FunctionComponent<ReactButtonPropsState> = (
  props
) => {
  const { type, id, reaction, num_of_reactions, socket } = props;

  const reactToPost = React.useCallback(() => {
    if (socket && socket.readyState === socket.OPEN) {
      socket.send(
        JSON.stringify({
          pipe: POST_REACTION,
          post_id: id,
          reaction: /upvote|downvote/i.test(reaction || '') ? 'NEUTRAL' : type
        })
      );
    } else {
      emitUserOnlineStatus(true, false, {
        open: true,
        message:
          "Something went wrong. Seems you are/were offline. We'll try to reconnect then you can try again.",
        severity: 'info',
        autoHide: false
      });
    }
  }, [socket, id, type, reaction]);

  // React.useEffect(() => {

  // }, []);

  return (
    <Button
      className={`d-flex align-items-center reaction-button reaction-${reaction?.toLowerCase()}`}
      onClick={reactToPost}>
      {type === 'UPVOTE' ? <UpvoteSharpIcon /> : <DownvoteSharpIcon />}
      <Box>{bigNumberFormat(num_of_reactions)}</Box>
    </Button>
  );
};

export default connect(({ webSocket }: any) => ({ socket: webSocket }))(
  ReactButton
);
