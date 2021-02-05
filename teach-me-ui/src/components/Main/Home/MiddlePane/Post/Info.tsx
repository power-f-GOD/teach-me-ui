import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';

import { bigNumberFormat } from '../../../../../utils';
import { UserData, PostStateProps } from '../../../../../types';

import { FAIcon } from '../../../../shared';
import { POST_REACTION__LIKE, POST_REACTION__DOWNVOTE } from '../../../../../constants';

const PostInfo = (props: {
  reactions?: UserData[];
  reply_count?: number;
  reaction: PostStateProps['reaction'];
  isLoading: boolean;
  reaction_count: number;
  sender?: UserData;
  userId?: string;
}) => {
  const {
    reactions,
    reply_count,
    reaction,
    isLoading,
    reaction_count,
    sender,
    userId
  } = props;
  const colleagueThatUpvoted = reactions?.find(
    (colleague) =>
      colleague.reaction === POST_REACTION__LIKE &&
      colleague.id !== sender?.id &&
      colleague.id !== userId
  );
  const oneLikes =
    !!reactions?.find((colleague) => colleague.reaction === POST_REACTION__LIKE) ||
    reaction === POST_REACTION__LIKE;
  const oneDislikes =
    !!reactions?.find((colleague) => colleague.reaction === POST_REACTION__DOWNVOTE) ||
    reaction === POST_REACTION__DOWNVOTE;

  return !isLoading ? (
    <Row className='post-info d-flex theme-tertiary'>
      <Col xs={9} className='d-inline-flex align-items-center px-0'>
        {(oneLikes || !reaction_count || (!oneLikes && !oneDislikes)) && (
          <FAIcon
            name='thumbs-up'
            className={`${oneLikes ? 'liked' : ''} mr-1`}
          />
        )}
        {(oneDislikes || !reaction_count || (!oneLikes && !oneDislikes)) && (
          <FAIcon
            name='thumbs-down'
            className={`${oneDislikes ? 'disliked' : ''} mr-1`}
          />
        )}
        <Col as='span' className='n-reactions font-bold mr-1'>
          {bigNumberFormat(reaction_count)}
        </Col>{' '}
        reaction{reaction_count === 1 ? '' : 's'}
        {!!colleagueThatUpvoted && (
          <Box
            component='span'
            className='text-ellipsis ml-2 pr-1'
            fontSize='0.85em'>
            (
            <Col as='span' className='font-bold theme-tertiary'>
              {colleagueThatUpvoted.first_name} {colleagueThatUpvoted.last_name}
            </Col>{' '}
            likes this)
          </Box>
        )}
      </Col>
      <Col className='text-right'>
        <Col as='span' className='font-bold'>
          {bigNumberFormat(reply_count!)}
        </Col>
        repl{reply_count === 1 ? 'y' : 'ies'}
      </Col>
    </Row>
  ) : null;
};

export default PostInfo;
