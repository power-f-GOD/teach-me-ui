import React, { useState, useCallback } from 'react';

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
import { processPostFn, openCreateRepostModal } from './Post';

export interface PostCrumbs extends Partial<PostPropsState> {
  navigate?: Function;
  openCreateRepostModal?: Function;
  repostMeta?: any;
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
    openCreateRepostModal
  } = props;
  const [openComment, setOpenComment] = useState(false);
  // console.table(openCreateRepostModal, repostMeta);
  const handleCommentClick = useCallback(() => {
    setOpenComment(!openComment);
  }, [openComment]);

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
      <CreateReply post_id={id!} className={openComment ? 'open' : ''} />
    </>
  );
};

export const Reply = (props: PostCrumbs) => {
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
    repostMeta
  } = props;

  return (
    <Box className='Reply'>
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
          <PostFooter
            id={id}
            upvotes={_upvotes}
            downvotes={_downvotes}
            reaction={reaction}
            reposts={reposts}
            replies={replies}
            openCreateRepostModal={openCreateRepostModal}
            repostMeta={repostMeta}
          />
        </Box>
      )}
    </Box>
  );
};

// export const PostFooter = (props: PostCrumbs) => {
//   const {
//     sec_type,
//     id,
//     text,
//     upvotes: _upvotes,
//     downvotes: _downvotes,
//     reaction,
//     reposts,
//     replies,
//     repostMeta,
//     openCreateRepostModal
//   } = props;

//   return (
//     <>
//       <Row className='post-footer'>
//         <Col className='reaction-wrapper d-flex align-items-center  '>
//           <ReactButton
//             id={
//               (sec_type === 'REPLY'
//                 ? parent?.id
//                 : text
//                 ? id
//                 : (parent?.id as string)) as string
//             }
//             reacted={
//               (sec_type === 'REPLY'
//                 ? (parent?.reaction as 'NEUTRAL')
//                 : text
//                 ? (reaction as 'NEUTRAL')
//                 : (parent?.reaction as 'NEUTRAL')) as 'NEUTRAL'
//             }
//             reactions={((): number => {
//               const upvotes: number = (sec_type === 'REPLY'
//                 ? (parent?.upvotes as number)
//                 : text
//                 ? (_upvotes as number)
//                 : (parent?.upvotes as number)) as number;

//               return upvotes as number;
//             })()}
//             type='UPVOTE'
//           />
//         </Col>
//         <Col className='reaction-wrapper d-flex align-items-center justify-content-center'>
//           <ReactButton
//             id={
//               (sec_type === 'REPLY'
//                 ? parent?.id
//                 : text
//                 ? id
//                 : (parent?.id as string)) as string
//             }
//             reacted={
//               (sec_type === 'REPLY'
//                 ? (parent?.reaction as 'NEUTRAL')
//                 : text
//                 ? (reaction as 'NEUTRAL')
//                 : (parent?.reaction as 'NEUTRAL')) as 'NEUTRAL'
//             }
//             reactions={((): number => {
//               const downvotes: number = (sec_type === 'REPLY'
//                 ? (parent?.downvotes as number)
//                 : text
//                 ? (_downvotes as number)
//                 : (parent?.downvotes as number)) as number;

//               return downvotes as number;
//             })()}
//             type='DOWNVOTE'
//           />
//         </Col>
//         <Col className='reaction-wrapper d-flex align-items-center justify-content-center'>
//           <Button
//             onClick={
//               openCreateRepostModal ? openCreateRepostModal(repostMeta) : null
//             }
//             className='d-flex align-items-center react-to-post justify-content-center'>
//             <RepostSharpIcon />
//             <Box>
//               {bigNumberFormat(
//                 (sec_type === 'REPLY'
//                   ? (parent?.reposts as number)
//                   : text
//                   ? (reposts as number)
//                   : (parent?.reposts as number)) as number
//               )}
//             </Box>
//           </Button>
//         </Col>
//         <Col className='reaction-wrapper d-flex align-items-center justify-content-end ml-auto'>
//           <Button className='d-flex align-items-center react-to-post justify-content-center'>
//             <CommentRoundedIcon />
//             <Box>
//               {bigNumberFormat(
//                 (sec_type === 'REPLY'
//                   ? (parent?.replies as number)
//                   : text
//                   ? (replies as number)
//                   : (parent?.replies as number)) as number
//               )}
//             </Box>
//           </Button>
//         </Col>
//       </Row>
//       <CreateReply
//         post_id={`${
//           (sec_type === 'REPLY' ? parent?.id : text ? id : parent?.id) as string
//         }`}
//       />
//     </>
//   );
// };
