import React, { useEffect } from 'react';

import Container from 'react-bootstrap/Container';

import Button from '@material-ui/core/Button';

import { dispatch, loopThru, createObserver } from '../../../../../utils';
import { PostStateProps, LoopFind, AuthState } from '../../../../../types';

import { displayModal } from '../../../../../functions';
import { fetchRepliesRequest } from '../../../../../actions';

import PostFooter from './Footer';
import PostReply from './Reply';
import {
  MAKE_REPOST,
  POST_INTERACTION,
  POST_INTERACTION__SEEN
} from '../../../../../constants';
import PostBody from './Body';
import PostHeader from './Header';
import PostInfo from './Info';
import Loader from '../../../../shared/Loaders';

export interface PostCrumbs extends Partial<PostStateProps> {
  navigate?: Function;
  openCreateRepostModal?: Function;
  repostMeta?: PostStateProps | any;
  anchorIsParent?: boolean;
  isLoading?: boolean;
  auth?: AuthState;
}

const postElementRef = React.createRef<any>();

let postElement: HTMLElement | null = null;

let observer: IntersectionObserver;

const Post: React.FC<
  Partial<PostStateProps> & {
    index?: number;
    postsErred?: boolean;
    userId?: string;
    forceUpdate?: any;
    quote?: any;
    webSocket?: WebSocket;
    pageReplies?: any;
    replyStatusText?: string;
    repliesStatus?: string;
  }
> = (props) => {
  const {
    index,
    postsErred,
    quote,
    userId,
    webSocket: socket,
    ...others
  } = props;
  const {
    // type,
    media,
    // sec_type,
    id,
    sender,
    text,
    reactions,
    date,
    parent,
    reaction,
    colleague_reposts,
    colleague_replies,
    reply_count,
    repost_count,
    upvote_count,
    downvote_count,
    head,
    numRepliesToShow: _numRepliesToShow,
    replies,
    pageReplies,
    replyStatusText
  } = others || {};
  const parent_id = parent?.id;
  const { username: sender_username, first_name, last_name, profile_photo } =
    sender || {};
  const sender_name = first_name ? `${first_name} ${last_name}` : '';
  let numRepliesToShow = _numRepliesToShow ?? 2;
  let mostRecentColleagueReplyIndex: number | null = null;

  let extra: string | null = '';

  useEffect(() => {
    if (head && id) {
      dispatch(fetchRepliesRequest(id));
    }
  }, [id, head]);

  useEffect(() => {
    postElement = postElementRef.current;

    if (postElement && !head) {
      observer = createObserver(
        null,
        (entries) => {
          const entry = entries[0];
          const emitSeen = (id: string, parent_id?: string) => {
            if (socket && socket.readyState === socket.OPEN) {
              socket.send(
                JSON.stringify({
                  pipe: POST_INTERACTION,
                  post_id: id,
                  interaction: POST_INTERACTION__SEEN
                })
              );
            }

            if (parent_id) {
              emitSeen(parent_id);
            }
          };

          if (entry.isIntersecting) {
            emitSeen(id!, parent_id);

            if (postElement) {
              observer.unobserve(postElement);
            }
          }
        },
        { threshold: [0.125] }
      );

      observer.observe(postElement);
    }

    return () => {
      if (postElement) {
        observer?.unobserve(postElement as Element);
      }
    };
  }, [id, head, socket, parent_id]);

  if (colleague_reposts?.length && colleague_reposts?.length > 1) {
    const firstReposter = colleague_reposts[0]?.sender;
    const sendersNames = Array.from(
      new Set(
        colleague_reposts.map(
          ({ sender: { first_name, username } }) => `${first_name} ${username}`
        )
      )
    );
    const senderName2 = sendersNames[1]?.split(' ')[0];

    switch (sendersNames.length) {
      case 1:
        extra = `<b>${firstReposter.first_name}</b> reposted ${
          firstReposter.id === sender!.id
            ? 'their own'
            : sender?.id === userId
            ? 'your'
            : `<b>${sender_name}</b>'s`
        } post <b>${colleague_reposts.length}</b> times`;
        break;
      case 2:
        extra = `<b>${
          sender?.id === userId ? 'You' : firstReposter.first_name
        }</b> and <b>${senderName2}</b> reposted ${
          sender?.id === userId ? 'your' : `<b>${sender_name}</b>'s`
        } post`;
        break;
      default:
        extra = `${
          firstReposter?.id === userId
            ? 'You'
            : `<b>${firstReposter.first_name}</b>`
        } and <b>${sendersNames?.length - 1} others</b> reposted ${
          sender?.id === userId ? 'your' : `<b>${first_name}</b>'s`
        }  post`;
    }
  } else if (parent) {
    extra = `<b>${sender_name}</b> reposted ${
      parent.sender!.id === sender!.id
        ? 'their own'
        : parent.sender!.id === userId
        ? 'your'
        : `<b>${parent.sender!.first_name}</b>'s`
    } post`;

    if (sender?.id === userId) {
      extra = '';
    }
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
          : `<b>${first_name}</b>'s`
      } post`;
      mostRecentColleagueReplyIndex = index;
    }
  }

  // attempt to display the most recent colleague reply (mentioned in extra) instead of (only) a self reply in case of any
  if (colleague_replies?.length) {
    const threshold =
      colleague_replies.length -
      (mostRecentColleagueReplyIndex ?? colleague_replies.length + 1);
    const indexIsGreaterThanThreshold = numRepliesToShow < threshold;

    if (indexIsGreaterThanThreshold) {
      numRepliesToShow = threshold;
    }

    numRepliesToShow = numRepliesToShow > 7 ? 7 : numRepliesToShow;
  }

  const fetchMoreReplies = () => {
    dispatch(fetchRepliesRequest(id, pageReplies[0].date));
  };

  const renderPostPageReplies = () => {
    const finalReplies = [...pageReplies, ...replies];
    return finalReplies!.map((reply: any) => (
      <PostReply {...reply} key={reply.id} />
    ));
  };

  return (
    <Container
      id={id}
      className={`Post ${postsErred ? 'remove-skeleton-animation' : ''} ${
        colleague_replies?.length ? 'has-replies' : ''
      } ${media?.length ? 'has-media' : ''} ${
        parent ? 'has-quote' : colleague_reposts?.length ? 'has-quotes' : ''
      } mx-0 px-0`}
      ref={postElementRef}>
      {extra && !head && (
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
        posted_at={date}
      />

      {/* Post body */}
      <PostBody
        head={!!props.head}
        isLoading={!sender_name}
        parent={parent}
        post_id={id!}
        text={text!}
        index={index}
        reposts={colleague_reposts}
        media={media}
      />

      {/* Post info */}
      <PostInfo
        isLoading={!reaction}
        reactions={reactions}
        reaction={reaction!}
        reaction_count={(upvote_count ?? 0) + (downvote_count ?? 0)}
        reply_count={reply_count}
        sender={sender}
        userId={userId}
      />

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
      {head && props.repliesStatus === 'pending' && pageReplies[0] ? (
        <Loader
          type='ellipsis'
          inline={true}
          color='#555'
          size={6}
          className='reply-loader'
        />
      ) : (
        head &&
        replyStatusText !== 'the end' &&
        pageReplies[0] && (
          <Button
            onClick={fetchMoreReplies}
            className='ml-2 previus-reply-button'>
            {' '}
            View previous replies
          </Button>
        )
      )}

      {/* Post replies */}
      {head
        ? renderPostPageReplies()
        : colleague_replies
            ?.slice(-numRepliesToShow)
            .map((reply) => <PostReply {...reply} key={reply.id} />)}
    </Container>
  );
};

export const openCreateRepostModal = (meta: any) => (e: any) => {
  displayModal(true, false, MAKE_REPOST, {
    title: 'Make Repost',
    post: meta
  });
};

export default Post;
