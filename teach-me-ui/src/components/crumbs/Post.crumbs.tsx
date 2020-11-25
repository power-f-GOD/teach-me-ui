import React, { useState, useCallback } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import RepostSharpIcon from '@material-ui/icons/CachedSharp';
import CommentRoundedIcon from '@material-ui/icons/CommentRounded';

import ReactButton from './ReactButton';
import { bigNumberFormat } from '../../functions/utils';
import { PostPropsState } from '../../constants/interfaces';

import CreateReply from './CreateReply';

import { Button } from '@material-ui/core';

export interface PostCrumbs extends Partial<PostPropsState> {
  navigate?: Function;
  openCreateRepostModal?: Function;
  repostMeta?: PostPropsState | any;
  anchorIsParent?: boolean;
}

export const PostFooter = (props: PostCrumbs) => {
  const {
    id,
    upvotes: _upvotes,
    downvotes: _downvotes,
    reaction,
    reposts,
    replies,
    repostMeta,
    openCreateRepostModal,
    anchorIsParent
  } = props;
  const [openCommentClassName, setOpenCommentClassName] = useState(
    anchorIsParent ? 'open' : ''
  );
  const handleCommentClick = useCallback(() => {
    setOpenCommentClassName(
      (/open/.test(openCommentClassName) ? 'close' : 'open') +
        ' triggered-by-button-click'
    );
  }, [openCommentClassName]);

  return (
    <>
      <Row className='post-footer'>
        <Col className='reaction-wrapper d-flex align-items-center  '>
          <ReactButton
            id={id!}
            reaction={reaction!}
            num_of_reactions={_upvotes!}
            type='UPVOTE'
          />
        </Col>
        <Col className='reaction-wrapper d-flex align-items-center justify-content-center'>
          <ReactButton
            id={id!}
            reaction={reaction!}
            num_of_reactions={_downvotes!}
            type='DOWNVOTE'
          />
        </Col>
        <Col className='reaction-wrapper d-flex align-items-center justify-content-center'>
          <Button
            onClick={
              openCreateRepostModal ? openCreateRepostModal(repostMeta) : null
            }
            className='d-flex align-items-center react-to-post justify-content-center'>
            <RepostSharpIcon />
            <Box>{bigNumberFormat(reposts!)}</Box>
          </Button>
        </Col>
        <Col className='reaction-wrapper d-flex align-items-center justify-content-end ml-auto'>
          <Button
            onClick={handleCommentClick}
            className='d-flex align-items-center react-to-post justify-content-center'>
            <CommentRoundedIcon />
            <Box>{bigNumberFormat(replies!)}</Box>
          </Button>
        </Col>
      </Row>
      <CreateReply post_id={id!} className={openCommentClassName} />
    </>
  );
};
