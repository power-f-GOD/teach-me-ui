import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import RepostSharpIcon from '@material-ui/icons/CachedSharp';
import CommentRoundedIcon from '@material-ui/icons/CommentRounded';
import { Button, Avatar } from '@material-ui/core';

import ReactButton from './ReactButton';
import CreateReply from './CreateReply';
import { processPost } from './Post';
import { bigNumberFormat, formatDate } from '../../functions/utils';
import { PostPropsState } from '../../constants/interfaces';

export interface PostCrumbs extends Partial<PostPropsState> {
  navigate?: Function;
  openCreateRepostModal?: Function;
  repostMeta?: PostPropsState | any;
  anchorIsParent?: boolean;
}

export const Reply: React.FC<Partial<PostPropsState>> = (props) => {
  const {
    // type,
    // media,
    // sec_type,
    id,
    sender,
    text,
    posted_at,
    upvotes: _upvotes,
    downvotes: _downvotes,
    reaction,
    reposts,
    replies
  } = props;
  const { username: sender_username, first_name, last_name, profile_photo } =
    sender || {};
  const sender_name = first_name ? `${first_name} ${last_name}` : '';

  // const history = useHistory();
  // const [mediaPreview, setMediaPreview] = useState(false);
  // const [selectedMedia, setSelectedMedia] = useState(0);

  // const showModal = (e: any) => {
  //   setSelectedMedia(parseInt(e.target.id));
  //   setMediaPreview(true);
  // };

  // const removeModal = (e: any) => {
  //   setMediaPreview(false);
  // };

  // const prev = (e: any) => {
  //   const newIndex = selectedMedia - 1;
  //   setSelectedMedia(newIndex < 0 ? 0 : newIndex);
  // };

  // const next = (e: any) => {
  //   const newIndex = selectedMedia + 1;
  //   setSelectedMedia(
  //     newIndex > (media as any[]).length - 1
  //       ? (media as any[]).length - 1
  //       : newIndex
  //   );
  // };

  return (
    <>
      {/* Post */}
      <Box id={id} className={`Reply fade-in-opacity`}>
        {/* Post header */}
        <Row className='post-header'>
          <Avatar
            className='post-avatar align-self-center mr-1'
            alt={sender_name}
            src={profile_photo ? profile_photo : ''}
          />
          <Col className='d-flex flex-column justify-content-center pl-2'>
            {sender_name ? (
              <>
                <Box className='d-flex'>
                  <Link to={`@${sender_username}`} className='font-bold'>
                    {sender_name}
                  </Link>
                  <Box className='theme-tertiary-lighter ml-1'>
                    | @{sender_username}
                  </Box>
                </Box>
                <Box component='small' className='theme-tertiary'>
                  {formatDate(+posted_at!)}
                </Box>
              </>
            ) : (
              <>
                <Skeleton width={150} />
                <Skeleton width={100} />
              </>
            )}
          </Col>
        </Row>

        {/* Post body */}
        {sender_name ? (
          <Row className='post-body'>
            {/* Post repost */}
            <Box component='div' className='text'>
              {processPost(text!)}
            </Box>
          </Row>
        ) : (
          <Box p={2}>
            <Skeleton count={3} />
          </Box>
        )}

        {/* Post footer (reaction buttons) */}
        {sender_name && (
          <Box>
            <PostFooter
              id={id}
              text={text}
              upvotes={_upvotes}
              downvotes={_downvotes}
              reaction={reaction}
              reposts={reposts}
              replies={replies}
              anchorIsParent={false}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

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
        {openCreateRepostModal && repostMeta && (
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
        )}
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
