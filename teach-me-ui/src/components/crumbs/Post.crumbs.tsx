import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import RepostSharpIcon from '@material-ui/icons/CachedSharp';
import CommentRoundedIcon from '@material-ui/icons/CommentRounded';

import { Link } from 'react-router-dom';

import ReactButton from './ReactButton';
import { bigNumberFormat, formatDate } from '../../functions/utils';
import { PostPropsState } from '../../constants/interfaces';

import CreateReply from './CreateReply';

import { Button } from '@material-ui/core';
import { processPostFn } from './Post';

export interface PostCrumbs extends Partial<PostPropsState> {
  setShowComment: Function;
  showComment: boolean;
  navigate: Function;
  openCreateRepostModal: Function;
  setShowComment2: Function;
  showComment2: boolean;
}

export const PostFooter = (props: Partial<PostCrumbs>) => {
  const {
    sec_type,
    id,
    text,
    parent,
    upvotes: _upvotes,
    downvotes: _downvotes,
    reaction,
    reposts,
    replies,
    openCreateRepostModal,
    setShowComment,
    showComment,
    setShowComment2,
    showComment2
  } = props;

  return (
    <Row className='post-footer'>
      <Col className='reaction-wrapper d-flex align-items-center  '>
        <ReactButton
          id={
            (sec_type === 'REPLY'
              ? parent?.id
              : text
              ? id
              : (parent?.id as string)) as string
          }
          reacted={
            (sec_type === 'REPLY'
              ? (parent?.reaction as 'NEUTRAL')
              : text
              ? (reaction as 'NEUTRAL')
              : (parent?.reaction as 'NEUTRAL')) as 'NEUTRAL'
          }
          reactions={((): number => {
            const upvotes: number = (sec_type === 'REPLY'
              ? (parent?.upvotes as number)
              : text
              ? (_upvotes as number)
              : (parent?.upvotes as number)) as number;

            return upvotes as number;
          })()}
          type='UPVOTE'
        />
      </Col>
      <Col className='reaction-wrapper d-flex align-items-center justify-content-center'>
        <ReactButton
          id={
            (sec_type === 'REPLY'
              ? parent?.id
              : text
              ? id
              : (parent?.id as string)) as string
          }
          reacted={
            (sec_type === 'REPLY'
              ? (parent?.reaction as 'NEUTRAL')
              : text
              ? (reaction as 'NEUTRAL')
              : (parent?.reaction as 'NEUTRAL')) as 'NEUTRAL'
          }
          reactions={((): number => {
            const downvotes: number = (sec_type === 'REPLY'
              ? (parent?.downvotes as number)
              : text
              ? (_downvotes as number)
              : (parent?.downvotes as number)) as number;

            return downvotes as number;
          })()}
          type='DOWNVOTE'
        />
      </Col>
      <Col className='reaction-wrapper d-flex align-items-center justify-content-center'>
        <Button
          onClick={
            openCreateRepostModal
              ? openCreateRepostModal(
                  sec_type === 'REPLY'
                    ? (parent as any)
                    : text
                    ? (props as any)
                    : (parent as any)
                )
              : null
          }
          className='d-flex align-items-center react-to-post justify-content-center'>
          <RepostSharpIcon />
          <Box>
            {bigNumberFormat(
              (sec_type === 'REPLY'
                ? (parent?.reposts as number)
                : text
                ? (reposts as number)
                : (parent?.reposts as number)) as number
            )}
          </Box>
        </Button>
      </Col>
      <Col className='reaction-wrapper d-flex align-items-center justify-content-end ml-auto'>
        <Button
          onClick={() =>
            (setShowComment || setShowComment2 || (() => {}))(
              showComment !== undefined ? !showComment : !showComment2
            )
          }
          className='d-flex align-items-center react-to-post justify-content-center'>
          <CommentRoundedIcon />
          <Box>
            {bigNumberFormat(
              (sec_type === 'REPLY'
                ? (parent?.replies as number)
                : text
                ? (replies as number)
                : (parent?.replies as number)) as number
            )}
          </Box>
        </Button>
      </Col>
    </Row>
  );
};

export const PostReply = (props: Partial<PostCrumbs>) => {
  const {
    // sec_type,
    sender_name,
    id,
    text,
    profile_photo,
    userAvatar,
    sender_username,
    posted_at,
    upvotes: _upvotes,
    downvotes: _downvotes,
    reaction,
    reposts,
    replies,
    navigate,
    setShowComment2,
    showComment2,
    openCreateRepostModal
  } = props;

  return (
    <Box className='inner-comment pl-5'>
      <Row className='container-fluid px-2 mx-auto p-0 align-items-center'>
        <Avatar
          component='span'
          className='post-avatar'
          alt={sender_name}
          src={profile_photo ? profile_photo : `/images/${userAvatar}`}
        />
        <Col className='d-flex flex-grow-1 flex-column'>
          <Link to={`@${sender_username}`} className='post-sender'>
            {sender_name}
          </Link>
          <Box component='div' color='#777'>
            @{sender_username}
          </Box>
        </Col>
      </Row>
      <Row className='container-fluid  mx-auto'>
        <Box
          component='div'
          pt={1}
          px={0}
          ml={5}
          width='100%'
          onClick={navigate ? navigate(id as string) : null}
          className='break-word'>
          {processPostFn(text as string)}
        </Box>
        <Box
          component='small'
          textAlign='right'
          width='100%'
          color='#888'
          pt={1}
          mr={3}>
          {formatDate(posted_at as number)}
        </Box>
      </Row>
      {sender_name && (
        <Box py={1} mt={1}>
          {/* <PostFooter
            // id={}
            // reaction={reaction}
            // upvotes={_upvotes}
            // downvotes={_downvotes}
            {...props}
            openCreateRepostModal={openCreateRepostModal}
            setShowComment2={setShowComment2}
          /> */}
          <Row className='m-0 px-3'>
            <Col
              xs={3}
              className='ml-auto d-flex align-items-center justify-content-center'>
              <ReactButton
                id={id as string}
                reacted={reaction as 'NEUTRAL'}
                reactions={_upvotes as number}
                type='UPVOTE'
              />
            </Col>
            <Col
              xs={3}
              className='d-flex align-items-center justify-content-center'>
              <ReactButton
                id={id as string}
                reacted={reaction as 'NEUTRAL'}
                reactions={_downvotes as number}
                type='DOWNVOTE'
              />
            </Col>
            <Col className='d-flex align-items-center justify-content-center'>
              <Box
                padding='5px 15px'
                onClick={
                  openCreateRepostModal ? openCreateRepostModal(props) : null
                }
                className='d-flex align-items-center react-to-post justify-content-center'
                fontSize='13px'>
                <RepostSharpIcon />
                <Box padding='0 5px' fontSize='13px'>
                  {bigNumberFormat(reposts)}
                </Box>
              </Box>
            </Col>
            <Col className='d-flex align-items-center justify-content-center'>
              <Box
                padding='5px 15px'
                onClick={
                  setShowComment2
                    ? () => setShowComment2(!showComment2)
                    : undefined
                }
                className='d-flex align-items-center react-to-post justify-content-center'
                fontSize='13px'>
                CM
                <Box padding='0 5px' fontSize='13px'>
                  {bigNumberFormat(replies)}
                </Box>
              </Box>
            </Col>
          </Row>

          {showComment2 && <CreateReply post_id={id} />}
        </Box>
      )}
    </Box>
  );
};
