import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Skeleton from 'react-loading-skeleton';

import Box from '@material-ui/core/Box';
import { Button } from '@material-ui/core';

import ReactionButton from './ReactionButton';

import { PostCrumbs } from '.';
import { bigNumberFormat, formatDate } from '../../../../../utils';
import { AuthState } from '../../../../../types';
import { FAIcon } from '../../../../shared';
import CreateReply from './CreateReply';

const PostFooter = (props: PostCrumbs) => {
  const {
    id,
    upvote_count,
    downvote_count,
    repost_count,
    reaction,
    repostMeta,
    reposted,
    openCreateRepostModal,
    date,
    anchorIsParent,
    isLoading,
    auth
  } = props;
  const [openCommentClassName, setOpenCommentClassName] = useState('');

  const handleCommentClick = useCallback(() => {
    setOpenCommentClassName(
      (/open/.test(openCommentClassName) ? 'close' : 'open') +
        ' triggered-by-button-click'
    );
  }, [openCommentClassName]);

  if (!auth?.isAuthenticated) {
    return null;
  }

  if (!isLoading)
    return (
      <>
        <Row className='post-footer'>
          {date && (
            <Col
              xs={3}
              sm={2}
              as='small'
              className='theme-tertiary px-0 text-ellipsis'>
              {formatDate(date)?.replace('ago', '')}
            </Col>
          )}
          <Col className='reaction-wrapper d-flex align-items-center'>
            <ReactionButton
              id={id!}
              reaction={reaction === 'UPVOTE' ? reaction : null}
              num_of_reactions={upvote_count!}
              type='UPVOTE'
            />
          </Col>
          <Col className='reaction-wrapper justify-content-sm-start justify-content-start d-flex align-items-center'>
            <ReactionButton
              id={id!}
              reaction={reaction === 'DOWNVOTE' ? reaction : null}
              num_of_reactions={downvote_count!}
              type='DOWNVOTE'
            />
          </Col>
          {openCreateRepostModal && repostMeta && (
            <Col className='reaction-wrapper d-flex justify-content-sm-end justify-content-start align-items-center'>
              <Button
                onClick={
                  openCreateRepostModal
                    ? openCreateRepostModal(repostMeta)
                    : null
                }
                className={`ReactionButton d-flex align-items-center justify-content-center ${
                  reposted ? 'reposted' : ''
                }`}>
                <FAIcon name='retweet' />
                <Box>{bigNumberFormat(repost_count!)}</Box>
                <Box
                  component='span'
                  className='desc d-none d-sm-inline d-md-none d-xl-inline'>
                  repost{repost_count! === 1 ? '' : 's'}
                </Box>
              </Button>
            </Col>
          )}

          <Col
            xs={3}
            sm={date ? 5 : 3}
            md={4}
            className='reaction-wrapper d-flex align-items-center justify-content-end mr-0'>
            {anchorIsParent && (
              <Button
                onClick={handleCommentClick}
                className='d-flex align-items-center react-to-post justify-content-center'>
                <FAIcon name='comment-dots' />
              </Button>
            )}
          </Col>
        </Row>
        <CreateReply
          post_id={id!}
          className={openCommentClassName}
          setOpenCommentClassName={setOpenCommentClassName}
        />
      </>
    );

  return (
    <Container className='d-flex justify-content-between pt-1 pr-3 pl-2 pb-2'>
      <Skeleton
        width='5rem'
        height='1.85em'
        className='button mr-4 ml-2 mt-2'
      />
      <Skeleton width='5rem' height='1.85em' className='mr-4 mt-2' />
      <Skeleton width='5rem' height='1.85em' className='mr-4 mt-2' />
      <Container className='w-auto'>
        <Skeleton width='4rem' className='mt-2' height='1.85em' />
      </Container>
    </Container>
  );
};

export default connect(({ auth }: { auth: AuthState }) => ({ auth }))(
  PostFooter
);
