import React from 'react';

import Box from '@material-ui/core/Box';
import UpvoteSharpIcon from '@material-ui/icons/ExpandLessSharp';
import DownvoteSharpIcon from '@material-ui/icons/ExpandMoreSharp';
import Button from '@material-ui/core/Button';

import { bigNumberFormat, reactToPostFn } from '../../functions';
import { ReactButtonPropsState } from '../../constants/interfaces';

const reactToPost = (id: string, type: 'UPVOTE' | 'NEUTRAL' | 'DOWNVOTE') => (
  e: any
) => {
  reactToPostFn(id, type);
};

const ReactButton: React.FunctionComponent<ReactButtonPropsState> = (props) => {
  const { type, id, reaction, num_of_reactions } = props;
  const upVoteColor = reaction === 'UPVOTE' ? 'green' : '#555';
  const downVoteColor = reaction === 'DOWNVOTE' ? 'red' : '#555';

  return (
    <Button
      className='d-flex align-items-center react-to-post'
      onClick={reactToPost(id, type)}>
      {type === 'UPVOTE' ? <UpvoteSharpIcon /> : <DownvoteSharpIcon />}
      <Box
        color={
          props.type === 'UPVOTE'
            ? upVoteColor
            : props.type === 'DOWNVOTE'
            ? downVoteColor
            : '#555'
        }>
        {bigNumberFormat(num_of_reactions)}
      </Box>
    </Button>
  );
};

export default ReactButton;
