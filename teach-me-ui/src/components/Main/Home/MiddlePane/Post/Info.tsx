import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';

import { bigNumberFormat } from '../../../../../functions/utils';
import { UserData } from '../../../../../types';

import { FAIcon } from '../../../../shared/Icons';
import { UPVOTE } from '../../../../../constants';

const PostInfo = (props: {
  reactions?: UserData[];
  reply_count?: number;
  isLoading: boolean;
  reaction_count: number;
  sender?: UserData;
  userId?: string;
}) => {
  const {
    reactions,
    reply_count,
    isLoading,
    reaction_count,
    sender,
    userId
  } = props;
  const colleagueThatUpvoted = reactions?.find(
    (colleague) =>
      colleague.reaction === UPVOTE &&
      colleague.id !== sender?.id &&
      colleague.id !== userId
  );

  return !isLoading ? (
    <Row className='post-info d-flex theme-tertiary'>
      <Col xs={9} className='d-inline-flex align-items-center px-0'>
        <FAIcon name='thumbs-up' />
        <FAIcon name='thumbs-down' />
        <Col as='span' className='n-reactions font-bold mr-1'>
          {bigNumberFormat(reaction_count)}
        </Col>{' '}
        reaction{reaction_count === 1 ? '' : 's'}
        {!!colleagueThatUpvoted && (
          <Box
            component='span'
            className='font-italic text-ellipsis ml-2 pr-1'
            fontSize='0.85em'>
            (
            <Col as='span' className='font-bold theme-tertiary'>
              {colleagueThatUpvoted.first_name} {colleagueThatUpvoted.last_name}
            </Col>{' '}
            upvoted)
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