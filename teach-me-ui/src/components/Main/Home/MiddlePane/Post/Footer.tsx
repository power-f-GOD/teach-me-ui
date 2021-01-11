import React, { useState, useCallback } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Skeleton from 'react-loading-skeleton';

import Box from '@material-ui/core/Box';
import { Button } from '@material-ui/core';

import { FAIcon } from '../../../../shared/Icons';
import ReactionButton from './ReactionButton';

import { PostCrumbs } from '.';
import { bigNumberFormat } from '../../../../../functions/utils';

import CreateReply from './CreateReply';

const PostFooter = (props: PostCrumbs) => {
  const {
    id,
    upvote_count,
    downvote_count,
    repost_count,
    reply_count,
    reaction,
    repostMeta,
    reposted,
    openCreateRepostModal,
    anchorIsParent,
    isLoading
  } = props;
  const [openCommentClassName, setOpenCommentClassName] = useState('');
  const handleCommentClick = useCallback(() => {
    setOpenCommentClassName(
      (/open/.test(openCommentClassName) ? 'close' : 'open') +
        ' triggered-by-button-click'
    );
  }, [openCommentClassName]);

  if (!isLoading)
    return (
      <>
        <Row className='post-footer'>
          <Col className='reaction-wrapper d-flex align-items-center'>
            <ReactionButton
              id={id!}
              reaction={reaction === 'UPVOTE' ? reaction : null}
              num_of_reactions={upvote_count!}
              type='UPVOTE'
            />
          </Col>
          <Col className='reaction-wrapper d-flex align-items-center'>
            <ReactionButton
              id={id!}
              reaction={reaction === 'DOWNVOTE' ? reaction : null}
              num_of_reactions={downvote_count!}
              type='DOWNVOTE'
            />
          </Col>
          {openCreateRepostModal && repostMeta && (
            <Col className='reaction-wrapper d-flex align-items-center'>
              <Button
                onClick={
                  openCreateRepostModal
                    ? openCreateRepostModal(repostMeta)
                    : null
                }
                className={`ReactionButton d-flex align-items-center justify-content-center ${
                  reposted ? 'reposted' : ''
                }`}>
                <FAIcon className='fa-retweet' />
                <Box>{bigNumberFormat(repost_count!)}</Box>
              </Button>
            </Col>
          )}
          <Col className='reaction-wrapper d-flex align-items-center justify-content-end ml-auto mr-0'>
            {anchorIsParent && (
              <Button
                onClick={handleCommentClick}
                className='d-flex align-items-center react-to-post justify-content-center'>
                <FAIcon className='fa-comment-dots' />
                <Box>{bigNumberFormat(reply_count!)}</Box>
              </Button>
            )}
          </Col>
        </Row>
        <CreateReply post_id={id!} className={openCommentClassName} />
      </>
    );

  return (
    <Container className='d-flex px-3 pb-2'>
      <Skeleton width='4rem' height='1.65rem' className='mr-2 mt-2' />
      <Skeleton width='4rem' height='1.65rem' className='mr-2 mt-2' />
      <Skeleton width='4rem' height='1.65rem' className='mr-2 mt-2' />
      <Container className='ml-auto w-auto'>
        <Skeleton width='4rem' className='mt-2' height='1.65rem' />
      </Container>
    </Container>
  );
};

export default PostFooter;
