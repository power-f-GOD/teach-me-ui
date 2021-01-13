import React, { useState } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';

import ArrowBack from '@material-ui/icons/ArrowBackIos';
import ArrowForward from '@material-ui/icons/ArrowForwardIos';

import { Link } from 'react-router-dom';

import {
  dispatch,
  loopThru,
  bigNumberFormat
} from '../../../../../functions/utils';
import { PostStateProps, LoopFind } from '../../../../../constants/interfaces';

import { displayModal } from '../../../../../functions';
import { triggerSearchKanyimuta } from '../../../../../actions/search';

import { LazyLoadImage as LazyImg } from 'react-lazy-load-image-component';

import PostFooter from './Footer';
import PostReply from './Reply';
import { CREATE_REPOST } from '../../../../../constants/modals';
import PostBody from './Body';
import PostHeader from './Header';
import { FAIcon } from '../../../../shared/Icons';

export interface PostCrumbs extends Partial<PostStateProps> {
  navigate?: Function;
  openCreateRepostModal?: Function;
  repostMeta?: PostStateProps | any;
  anchorIsParent?: boolean;
  isLoading?: boolean;
}

const stopProp = (e: any) => {
  e.stopPropagation();
};

export const processPost = (post: string) => {
  if (!post) return;

  const mid = post.replace(/([\t\r\n\f]+)/gi, ' $1 ');
  return mid
    .trim()
    .split(/ /gi)
    .map((w, i) => {
      w = w.replace(/ /gi, '');
      return /(^@)[A-Za-z0-9_]+[,.!?]*$/.test(w) ? (
        <Box component='span' key={i}>
          <Link
            onClick={stopProp}
            to={`/${/[,.!]+$/.test(w) ? w.slice(0, -1) : w}`}>{`${
            /[,.!]+$/.test(w) ? w.slice(0, -1) : w
          }`}</Link>
          {`${/[,.!]+$/.test(w) ? w.slice(-1) : ''}`}{' '}
        </Box>
      ) : /(^#)[A-Za-z0-9_]+[,.!?]*$/.test(w) ? (
        <Box component='span' key={i}>
          <Link
            onClick={(e: any) => {
              stopProp(e);
              dispatch(triggerSearchKanyimuta(w)(dispatch));
            }}
            to={`/search?q=${w.substring(1)}`}>
            {w}
          </Link>{' '}
        </Box>
      ) : /^https?:\/\/(?!\.)[A-Za-z0-9.-]+.[A-Za-z0-9.]+(\/[A-Za-z-/0-9@]+)?$/.test(
          w
        ) ? (
        <Box component='span' key={i}>
          <a onClick={stopProp} href={w} target='blank'>
            {w}
          </a>{' '}
        </Box>
      ) : (
        <React.Fragment key={i}>{w} </React.Fragment>
      );
    });
};

export const openCreateRepostModal = (meta: any) => (e: any) => {
  displayModal(true, false, CREATE_REPOST, {
    title: 'Create Repost',
    post: meta
  });
};

const Post: React.FC<
  Partial<PostStateProps> & {
    index?: number;
    postsErred?: boolean;
    quote?: PostStateProps;
    userId?: string;
    forceUpdate?: any;
  }
> = (props) => {
  const { index, postsErred, quote, userId, ...others } = props;
  const {
    // type,
    media,
    // sec_type,
    id,
    sender,
    text,
    date: posted_at,
    reaction,
    colleague_reposts,
    colleague_replies,
    reply_count,
    repost_count,
    upvote_count,
    downvote_count,
    numRepliesToShow
  } = others || {};
  const { username: sender_username, first_name, last_name, profile_photo } =
    sender || {};
  const sender_name = first_name ? `${first_name} ${last_name}` : '';
  const numReactions = upvote_count! + +downvote_count!;
  let mostRecentColleagueReplyIndex: number | null = null;

  const [mediaPreview, setMediaPreview] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(0);

  let extra: string | null = '';

  const removeModal = (e: any) => {
    setMediaPreview(false);
  };

  const prev = () => {
    const newIndex = selectedMedia - 1;
    setSelectedMedia(newIndex < 0 ? 0 : newIndex);
  };

  const next = () => {
    const newIndex = selectedMedia + 1;
    setSelectedMedia(
      newIndex > (media as any[]).length - 1
        ? (media as any[]).length - 1
        : newIndex
    );
  };

  if (colleague_reposts?.length && colleague_reposts?.length > 1) {
    let senderName1 = `${colleague_reposts[0]?.sender?.first_name} ${colleague_reposts[0]?.sender?.last_name}`;
    let senderName2 = `${colleague_reposts[1]?.sender?.first_name} ${colleague_reposts[1]?.sender?.last_name}`;

    switch (colleague_reposts.length) {
      case 2:
        extra = `<b>${senderName1}</b> and <b>${senderName2}</b> reposted <b>${sender_name}</b>'s post`;
        break;
      default:
        extra = `<b>${senderName1}</b> and <b>${colleague_reposts?.length} others</b> reposted <b>${sender_name}</b>'s post`;
    }
  } else if (quote) {
    extra = `<b>${sender_name}</b> reposted <b>${quote.sender?.first_name} ${quote.sender?.last_name}</b>'s post`;
  } else if (colleague_replies?.length) {
    const { value: reply, index } = (loopThru(
      colleague_replies,
      (reply) => reply.sender?.id !== userId,
      {
        type: 'find',
        rightToLeft: true,
        includeIndex: true
      }
    ) ?? {}) as LoopFind<PostStateProps>;

    if (reply) {
      extra = `<b>${reply.sender.first_name} ${
        reply.sender.last_name
      }</b> replied ${
        sender?.id === userId
          ? 'your'
          : reply.sender.username === sender_username
          ? 'their own'
          : `<b>${sender_name}</b>'s`
      } post`;
      mostRecentColleagueReplyIndex = index;
    }
  }

  // const nReplies = colleague_replies?.length;
  // React.useEffect(() => {
  //   if (nReplies) {
  //     const reply = colleague_replies?.slice(-1)[0];
  //     // console.log(reply, userId, nReplies);
  //     if (reply?.pipe && reply?.sender?.id === userId) {
  //       setNumRepliesToShow((prev) => prev + 1);
  //     }
  //   }
  // }, [colleague_replies, nReplies, userId]);

  return (
    <>
      <Modal
        onClose={removeModal}
        className='modal-wrapper'
        style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}
        open={mediaPreview}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,
          style: {
            background: 'rgba(0,0,0,0.7)'
          }
        }}>
        <>
          <div onClick={prev}>
            <Box
              component='button'
              className='carousel-btn'
              height='30px'
              width='30px'
              border='none'
              borderRadius='50%'>
              <ArrowBack />
            </Box>
          </div>
          {media && media.length && (
            <Fade in={true}>
              <LazyImg
                src={
                  JSON.parse((media as any[])[selectedMedia]).type === 'raw'
                    ? '/images/file-icon.svg'
                    : JSON.parse((media as any[])[selectedMedia]).url
                }
                alt='post'
                style={{
                  maxHeight: '70vh',
                  maxWidth: '70vh'
                }}
              />
            </Fade>
          )}
          <div onClick={next}>
            <Box
              component='button'
              className='carousel-btn'
              height='30px'
              width='30px'
              border='none'
              borderRadius='50%'>
              <ArrowForward />
            </Box>
          </div>
        </>
      </Modal>

      {/* Post */}
      <Box
        id={id}
        className={`Post ${postsErred ? 'remove-skeleton-animation' : ''} ${
          colleague_replies?.length ? 'has-replies' : ''
        } ${media?.length ? 'has-media' : ''} ${quote ? 'has-quote' : ''}`}>
        {extra && (
          <small
            className='extra'
            dangerouslySetInnerHTML={{ __html: extra }}></small>
        )}

        {/* Post header */}
        <PostHeader
          isLoading={!sender_name}
          sender_name={sender_name}
          sender_username={sender_username}
          profile_photo={profile_photo}
          posted_at={posted_at}
        />

        {/* Post body */}
        <PostBody
          isLoading={!sender_name}
          quote={quote}
          post_id={id!}
          text={text!}
          index={index}
          reposts={colleague_reposts}
          media={media}
          setMediaPreview={setMediaPreview}
          setSelectedMedia={setSelectedMedia}
        />

        {/* Post info */}
        {reaction && (
          <Row className='post-info d-flex theme-tertiary'>
            <Col>
              <FAIcon className='fa-thumbs-up' />
              <FAIcon className='fa-thumbs-down' />
              <Col as='span' className='font-bold'>
                {bigNumberFormat(numReactions)}
              </Col>
              reaction{numReactions === 1 ? '' : 's'}
            </Col>
            <Col className='text-right'>
              <Col as='span' className='font-bold'>
                {bigNumberFormat(reply_count!)}
              </Col>
              repl{reply_count === 1 ? 'y' : 'ies'}
            </Col>
          </Row>
        )}

        {/* Post footer (reaction buttons) */}
        <PostFooter
          isLoading={!reaction}
          id={id}
          text={text}
          upvote_count={upvote_count}
          downvote_count={downvote_count}
          reaction={reaction}
          repost_count={repost_count}
          reply_count={reply_count}
          repostMeta={others}
          anchorIsParent={true}
          openCreateRepostModal={openCreateRepostModal}
        />

        {/* Post replies */}
        {colleague_replies
          ?.slice(
            // attempt to display the most recent colleague reply (mentioned in extra) instead of a self reply in case of a self reply
            mostRecentColleagueReplyIndex ?? -(numRepliesToShow ?? 3),
            mostRecentColleagueReplyIndex !== null
              ? mostRecentColleagueReplyIndex + (numRepliesToShow ?? 2)
              : undefined
          )
          .map((reply) => (
            <PostReply {...reply} key={reply.id} />
          ))}
      </Box>
    </>
  );
};

export default Post;
