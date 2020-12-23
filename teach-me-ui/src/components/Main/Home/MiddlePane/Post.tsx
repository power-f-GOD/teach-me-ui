import React, { useState } from 'react';

import Axios from 'axios';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';

import ArrowBack from '@material-ui/icons/ArrowBackIos';
import ArrowForward from '@material-ui/icons/ArrowForwardIos';

import Skeleton from 'react-loading-skeleton';

import { Link, useHistory } from 'react-router-dom';

import { dispatch, formatDate } from '../../../../functions/utils';
import { PostStateProps } from '../../../../constants/interfaces';

import { displayModal } from '../../../../functions';
import { triggerSearchKanyimuta } from '../../../../actions/search';

import { LazyLoadImage as LazyImg } from 'react-lazy-load-image-component';

import { PostFooter, Reply, QuotedPost } from './Post.crumbs';
import { CREATE_REPOST } from '../../../../constants/modals';

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
  }
> = (props) => {
  const { index, postsErred, quote, ...others } = props;
  const {
    // type,
    media,
    // sec_type,
    id,
    sender,
    text,
    date: posted_at,
    reaction,
    reposts,
    replies,
    reply_count,
    repost_count,
    upvote_count,
    downvote_count
  } = others || {};
  const { username: sender_username, first_name, last_name, profile_photo } =
    sender || {};
  const sender_name = first_name ? `${first_name} ${last_name}` : '';

  const history = useHistory();
  const [mediaPreview, setMediaPreview] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(0);

  let extra: string | null = '';

  const navigate = (id: string) => (e: any) => {
    if (2 > 3) history.push(`/p/${id}`);
  };

  const showModal = (e: any) => {
    setSelectedMedia(parseInt(e.target.id));
    setMediaPreview(true);
  };

  const removeModal = (e: any) => {
    setMediaPreview(false);
  };

  const prev = (e: any) => {
    const newIndex = selectedMedia - 1;
    setSelectedMedia(newIndex < 0 ? 0 : newIndex);
  };

  const next = (e: any) => {
    const newIndex = selectedMedia + 1;
    setSelectedMedia(
      newIndex > (media as any[]).length - 1
        ? (media as any[]).length - 1
        : newIndex
    );
  };

  if (reposts?.length && reposts?.length > 1) {
    let senderName1 = `${reposts[0]?.sender?.first_name} ${reposts[0]?.sender?.last_name}`;
    let senderName2 = `${reposts[1]?.sender?.first_name} ${reposts[1]?.sender?.last_name}`;

    switch (reposts.length) {
      case 2:
        extra = `<b>${senderName1}</b> and <b>${senderName2}</b> reposted ${sender_name}'s post`;
        break;
      default:
        extra = `<b>${senderName1}</b> and <b>${reposts?.length} others</b> reposted ${sender_name}'s post`;
    }
  } else if (quote) {
    extra = `<b>${sender_name}</b> reposted <b>${quote.sender?.first_name} ${quote.sender?.last_name}'s</b> post`;
  }

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
          replies?.length ? 'has-replies' : ''
        } ${media?.length ? 'has-media' : ''} ${quote ? 'has-quote' : ''}`}>
        {extra && (
          <small
            className='extra'
            dangerouslySetInnerHTML={{ __html: extra }}></small>
        )}

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
                <Box className='d-flex'>
                  <Skeleton width={150} />
                  <Box className='theme-tertiary-lighter ml-2'>
                    <Skeleton width={100} />
                  </Box>
                </Box>
                <Box component='small' className='theme-tertiary'>
                  <Skeleton width={100} />
                </Box>
              </>
            )}
          </Col>
        </Row>

        {/* Post body */}
        {sender_name ? (
          <Row className='post-body'>
            {/* Post repost */}

            {quote && (
              <QuotedPost {...quote} navigate={navigate} key={quote.id} />
            )}

            <Box
              component='div'
              onClick={navigate(id!)}
              className={`text ${!text?.trim() ? 'py-2' : ''}`}
              data-id={id}>
              {processPost(text!)}
            </Box>

            {/* {sec_type === 'REPOST' &&
              text && */}
            {!quote &&
              reposts?.map((repost) => (
                <QuotedPost {...repost} navigate={navigate} key={repost.id} />
              ))}

            {media?.length! > 0 && (
              <Box
                className='media-container'
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: `repeat(${
                    (media as any[]).length === 1
                      ? 2
                      : Math.ceil((media as any[]).length / 2)
                  }, 9rem)`,
                  gridAutoFlow: 'row',
                  columnGap: '0.2rem',
                  rowGap: '0.2rem'
                }}>
                {media?.map((m, i, self) => {
                  const style: any = {};
                  switch (i) {
                    case 0:
                      if (self.length === 1) {
                        style.gridColumn = '1 / 3';
                        style.gridRow = '1 / 3';
                      }
                      if (self.length === 3 || self.length === 5) {
                        style.gridColumn = '1';
                        style.gridRow = '1 / 3';
                      }
                      break;
                  }
                  const mData = JSON.parse(m);
                  const url =
                    mData.type === 'raw' ? '/images/file-icon.svg' : mData.url;
                  return (
                    <div key={i} style={style}>
                      <LazyImg
                        id={i.toString()}
                        onClick={
                          mData.type === 'raw' || true
                            ? () => {
                                if (2 > 3)
                                  Axios({
                                    url: mData.url,
                                    method: 'GET',
                                    responseType: 'blob'
                                  }).then((res) => {
                                    const dataURL = URL.createObjectURL(
                                      new Blob([res.data])
                                    );
                                    const a = document.createElement('a');
                                    a.href = dataURL;
                                    a.download = 'file';
                                    a.click();
                                  });
                              }
                            : showModal
                        }
                        src={url}
                        alt='post'
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center',
                          verticalAlign: 'middle',
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    </div>
                  );
                })}
              </Box>
            )}
          </Row>
        ) : (
          <Box p={1}>
            {(index ?? 0) % 2 === 0 ? (
              <Skeleton height='14rem' className='media' />
            ) : (
              <>
                <Skeleton height='1rem' width='50%' className='mb-2' />
                <Skeleton height='1rem' width='85%' className='mb-2' />
                <Skeleton height='1rem' width='60%' className='mb-2' />
              </>
            )}
            <Container className='d-flex'>
              <Skeleton width='4rem' height='1.5rem' className='mr-2 mt-2' />
              <Skeleton width='4rem' height='1.5rem' className='mr-2 mt-2' />
              <Skeleton width='4rem' height='1.5rem' className='mr-2 mt-2' />
              <Container className='ml-auto w-auto'>
                <Skeleton width='4rem' className='mt-2' height='1.5rem' />
              </Container>
            </Container>
          </Box>
        )}

        {/* Post footer (reaction buttons) */}
        {sender_name && (
          <Box>
            <PostFooter
              id={id}
              text={text}
              upvote_count={upvote_count}
              downvote_count={downvote_count}
              reaction={reaction}
              repost_count={repost_count}
              reply_count={reply_count}
              repostMeta={others}
              anchorIsParent={false}
              openCreateRepostModal={openCreateRepostModal}
            />
          </Box>
        )}

        {replies?.map((reply) => (
          <Reply {...reply} key={reply.id} />
        ))}
      </Box>
    </>
  );
};

export default Post;
