import React, { useState } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import RepostSharpIcon from '@material-ui/icons/CachedSharp';
import CommentRoundedIcon from '@material-ui/icons/CommentRounded';

import ArrowBack from '@material-ui/icons/ArrowBackIos';
import ArrowForward from '@material-ui/icons/ArrowForwardIos';

import Skeleton from 'react-loading-skeleton';

import { Link, useHistory } from 'react-router-dom';

import ReactButton from './ReactButton';
import { bigNumberFormat, dispatch, formatDate } from '../../functions/utils';
import { PostPropsState } from '../../constants/interfaces';

import CreateReply from './CreateReply';

import { displayModal } from '../../functions';
import { triggerSearchKanyimuta } from '../../actions/search';

import { LazyLoadImage as LazyImg } from 'react-lazy-load-image-component';
import Axios from 'axios';
import { Button } from '@material-ui/core';

const stopProp = (e: any) => {
  e.stopPropagation();
};

export const processPostFn = (post: string) => {
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

const openCreateRepostModal = (meta: any) => (e: any) => {
  displayModal(true, false, 'CREATE_REPOST', {
    title: 'Create Repost',
    post: meta
  });
};

const Post: React.FunctionComponent<
  Partial<PostPropsState> & Partial<{ head: boolean }>
> = (props) => {
  const {
    media,
    sec_type,
    sender_name,
    _extra,
    id,
    text,
    head,
    parent,
    profile_photo,
    userAvatar,
    sender_username,
    posted_at,
    upvotes: _upvotes,
    downvotes: _downvotes,
    reaction,
    reposts,
    replies
  } = props;
  const history = useHistory();
  const [showComment, setShowComment] = useState(false);
  const [showComment2, setShowComment2] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(0);

  let extra: string | null = null;

  const navigate = (id: string) => (e: any) => {
    history.push(`/p/${id}`);
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

  if (sec_type === 'REPOST') {
    extra = `${sender_name} reposted`;
  }

  if (_extra) {
    switch (_extra.type) {
      case 'UPVOTE':
        extra = `${_extra?.colleague_name} upvoted`;
        break;
      case 'DOWNVOTE':
        extra = `${_extra?.colleague_name} downvoted`;
        break;
    }
  }

  if (sec_type === 'REPLY') {
    extra = `${sender_name} replied`;
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
      <Box id={id} className='Post'>
        {((_extra && sec_type !== 'REPLY') ||
          (sec_type === 'REPOST' && !text)) &&
          !head && <small className='small-text'>{extra}</small>}
        {sec_type === 'REPLY' && !head && (
          <small className='small-text'>{extra}</small>
        )}

        {/* Post header */}
        <Row className='post-header'>
          <Avatar
            className='post-avatar align-self-center mr-1'
            alt={
              sec_type === 'REPLY'
                ? parent?.sender_name
                : text
                ? sender_name
                : parent?.sender_name
            }
            src={profile_photo ? profile_photo : ''}
          />
          <Col className='d-flex flex-column justify-content-center pl-2'>
            {sender_name ? (
              <>
                <Box className='d-flex'>
                  <Link
                    to={`@${
                      sec_type === 'REPLY'
                        ? parent?.sender_username
                        : text
                        ? sender_username
                        : parent?.sender_username
                    }`}
                    className='font-bold'>
                    {sec_type === 'REPLY'
                      ? parent?.sender_name
                      : text
                      ? sender_name
                      : parent?.sender_name}
                  </Link>
                  <Box className='theme-tertiary-lighter ml-1'>
                    | @
                    {sec_type === 'REPLY'
                      ? parent?.sender_username
                      : text
                      ? sender_username
                      : parent?.sender_username}
                  </Box>
                </Box>
                <Box component='small' className='theme-tertiary'>
                  {formatDate(
                    (sec_type === 'REPLY'
                      ? parent?.posted_at
                      : text
                      ? posted_at
                      : parent?.posted_at) as number
                  )}
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
            <Box
              component='div'
              onClick={navigate(
                (sec_type === 'REPLY'
                  ? parent?.id
                  : text
                  ? id
                  : parent?.id) as string
              )}
              className='text'>
              {processPostFn(
                (sec_type === 'REPLY'
                  ? parent?.text
                  : text
                  ? text
                  : parent?.text) as string
              )}
            </Box>

            {(media as any[]).length > 0 && (
              <Box
                pt={1}
                px={0}
                ml={5}
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
                {(media as any[]).map((m, i, self) => {
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
                          borderRadius: '0.2rem',
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
          <Box p={2} pl={3}>
            <Skeleton count={3} />
          </Box>
        )}

        {/* Post repost */}
        {sec_type === 'REPOST' && text && (
          <Box className='quoted-post' onClick={navigate(parent?.id as string)}>
            <Row className='container-fluid px-2 mx-auto p-0 align-items-center'>
              <Avatar
                component='span'
                className='post-avatar'
                alt={parent?.sender_name}
                src={
                  parent?.profile_photo
                    ? parent?.profile_photo
                    : `/images/${parent?.userAvatar}`
                }
              />
              <Col className='d-flex flex-grow-1 flex-column'>
                <Link
                  to={`@${parent?.sender_username}`}
                  className='post-sender'>
                  {parent?.sender_name}
                </Link>
                <Box component='div' color='#777'>
                  @{parent?.sender_username}
                </Box>
              </Col>
            </Row>
            <Row className='container-fluid  mx-auto'>
              <Box component='div' pt={1} px={0} className='break-word'>
                {processPostFn(parent?.text as string)}
              </Box>
              <Box
                component='small'
                textAlign='right'
                width='100%'
                color='#888'
                pt={1}>
                {formatDate(parent?.posted_at as number)}
              </Box>
            </Row>
          </Box>
        )}

        {/* Post footer (reaction buttons) */}
        {sender_name && (
          <Box>
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
                  onClick={openCreateRepostModal(
                    sec_type === 'REPLY'
                      ? (parent as any)
                      : text
                      ? (props as any)
                      : (parent as any)
                  )}
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
                  onClick={() => setShowComment(!showComment)}
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
            {showComment && (
              <CreateReply
                post_id={`${
                  (sec_type === 'REPLY'
                    ? parent?.id
                    : text
                    ? id
                    : parent?.id) as string
                }`}
              />
            )}
          </Box>
        )}

        {/* Post reply */}
        {sec_type === 'REPLY' && (
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
                onClick={navigate(id as string)}
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
                      onClick={openCreateRepostModal(props)}
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
                      onClick={() => setShowComment2(!showComment2)}
                      className='d-flex align-items-center react-to-post justify-content-center'
                      fontSize='13px'>
                      <svg
                        width='15'
                        height='15'
                        viewBox='0 0 15 15'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'>
                        <path
                          className='pathignore'
                          d='M7.49948 0C5.47097 0 3.62339 0.795577 2.25797 2.12695C0.89254 3.45833 0 5.36581 0 7.5C0 9.6342 0.89254 11.5417 2.25797 12.8731C3.6234 14.2044 5.47097 15 7.49948 15H14.4222C14.9359 14.9998 15.1932 14.1922 14.83 13.7197L13.5027 11.9883C14.4568 10.7159 14.999 9.2307 14.999 7.5C14.999 5.36581 14.1054 3.45833 12.7399 2.12695C11.3745 0.795577 9.52806 0 7.49948 0ZM12.0481 3.32666C13.1882 4.43831 13.8452 5.90626 13.8452 7.5C13.8452 9.0381 13.3299 10.2131 12.2915 11.4214C12.0446 11.7089 12.0343 12.2069 12.2689 12.5112L13.0295 13.5H7.49948C5.70477 13.5 4.08982 12.7835 2.94975 11.6719C1.80968 10.5602 1.15374 9.09375 1.15374 7.5C1.15374 5.90626 1.80967 4.43831 2.94975 3.32666C4.08982 2.21502 5.70477 1.5 7.49948 1.5C9.29423 1.5 10.9081 2.21502 12.0481 3.32666Z'
                          fill='#555555'
                        />
                      </svg>
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
        )}
      </Box>
    </>
  );
};

export default Post;
