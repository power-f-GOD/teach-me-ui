import React from 'react';

import Box from '@material-ui/core/Box';

import { bigNumberFormat, reactToPostFn } from '../../functions';
import { ReactButtonPropsState } from '../../constants/interfaces';

const reactToPost = (id: string, type: 'UPVOTE' | 'NEUTRAL' | 'DOWNVOTE') => (
  e: any
) => {
  reactToPostFn(id, type);
};

const ReactButton: React.FunctionComponent<ReactButtonPropsState> = (props) => {
  const upVoteColor = props.reacted === 'UPVOTE' ? 'green' : '#555';
  const downVoteColor = props.reacted === 'DOWNVOTE' ? 'red' : '#555';

  return (
    <Box
      padding='5px 15px'
      className='d-flex align-items-center react-to-post justify-content-center'
      onClick={reactToPost(props.id, props.type)}>
      <svg
        width='12'
        height='7'
        viewBox='0 0 12 7'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'>
        {props.type === 'UPVOTE' && (
          <path
            d='M10.9594 7L11.6667 6.24531L5.83333 0L0 6.24531L0.703646 7L5.83333 1.51302L10.9594 7Z'
            fill={upVoteColor}
            stroke={upVoteColor}
            strokeWidth='1'
          />
        )}
        {props.type === 'DOWNVOTE' && (
          <path
            d='M0.707251 2.38419e-07L-4.02927e-05 0.754688L5.83329 7L11.6666 0.754688L10.963 2.38419e-07L5.83329 5.48698L0.707251 2.38419e-07Z'
            fill={downVoteColor}
            stroke={downVoteColor}
            strokeWidth='1'
          />
        )}
      </svg>
      <Box
        color={
          props.type === 'UPVOTE'
            ? upVoteColor
            : props.type === 'DOWNVOTE'
            ? downVoteColor
            : '#555'
        }
        padding='0 5px'
        fontSize='13px'>
        {bigNumberFormat(props.reactions)}
      </Box>
    </Box>
  );
};

export default ReactButton;
