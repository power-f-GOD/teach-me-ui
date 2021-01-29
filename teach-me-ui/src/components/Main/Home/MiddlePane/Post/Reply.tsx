import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';

import Skeleton from 'react-loading-skeleton';

import { Link } from 'react-router-dom';

import { PostStateProps } from '../../../../../types';

import PostFooter from './Footer';
import { processPost } from '.';
import TextTruncator from '../../../../shared/TextTruncator';

const PostReply = (props: Partial<PostStateProps>) => {
  const {
    // type,
    // media,
    // sec_type,
    id,
    sender,
    text,
    date,
    upvote_count,
    downvote_count,
    reaction,
    repost_count,
    reply_count
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
      <Box id={id} component='section' className={`Reply fade-in-opacity`}>
        {/* Post header */}
        <Row className='post-header'>
          <Avatar
            className='post-avatar align-self-center mr-1'
            alt={sender_name}
            src={profile_photo ? profile_photo : ''}
          />
          <Col className='display-name-wrapper d-flex flex-column justify-content-center'>
            {sender_name ? (
              <Box>
                <Link to={`/@${sender_username}`} className='font-bold'>
                  {sender_name}
                </Link>
                <Box component='span' className='theme-tertiary ml-1'>
                  | @{sender_username}
                </Box>
              </Box>
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
            <Col className='text'>
              {processPost(text!)}
              <TextTruncator anchorEllipsis={true} lineClamp={4} />
            </Col>
          </Row>
        ) : (
          <Box p={2}>
            <Skeleton count={3} />
          </Box>
        )}

        {/* Post footer (reaction buttons) */}
        <PostFooter
          isLoading={!sender_name}
          id={id}
          text={text}
          upvote_count={upvote_count}
          downvote_count={downvote_count}
          reaction={reaction}
          repost_count={repost_count}
          reply_count={reply_count}
          date={date}
          anchorIsParent={false}
        />
      </Box>
    </>
  );
};

export default PostReply;
