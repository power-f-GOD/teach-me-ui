import React, { useState } from 'react';

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

import ReactButton from './ReactButton';
import { bigNumberFormat, dispatch, formatDate } from '../../functions/utils';
import { PostPropsState } from '../../constants/interfaces';

import CreateReply from './CreateReply';

import { displayModal } from '../../functions';
import { triggerSearchKanyimuta } from '../../actions/search';

import { LazyLoadImage as LazyImg } from 'react-lazy-load-image-component';
import Axios from 'axios';
import { CREATE_REPOST } from '../../constants/modals';

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
  displayModal(true, false, CREATE_REPOST, {
    title: 'Create Repost',
    post: meta
  });
};

const Post: React.FunctionComponent<
  Partial<PostPropsState> & Partial<{ head: boolean }>
> = (props) => {
  const history = useHistory();
  const [showComment, setShowComment] = useState(false);
  const [showComment2, setShowComment2] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(0);

  let extra: string | null = null;
  if (props.sec_type === 'REPOST') {
    extra = `${props.sender_name} reposted`;
  }
  if (props._extra) {
    switch (props._extra.type) {
      case 'UPVOTE':
        extra = `${props._extra?.colleague_name} upvoted`;
        break;
      case 'DOWNVOTE':
        extra = `${props._extra?.colleague_name} downvoted`;
        break;
    }
  }
  if (props.sec_type === 'REPLY') {
    extra = `${props.sender_name} replied`;
  }
  const navigate = (id: string, type?: string) => (e: any) => {
    console.log(e.target)
    if (!(props.head)) {
      switch (type) {
        case 'repost':
          if (e.target.classList[0] !== 'post-sender') history.push(`/p/${id}`);
          break;
        case 'reply':
          if (
              e.target.classList[0] !== 'post-sender' && 
              e.target.classList[4] !== 'react-to-post' &&
              e.target.nodeName !== 'TEXTAREA' && 
              e.target.nodeName !== 'IMG' &&
              e.target.nodeName !== 'path' &&
              e.target.nodeName !== 'svg' && 
              e.target.parentNode.nodeName !== 'FORM' && 
              e.target.parentNode.nodeName !== 'BUTTON' &&
              e.target.parentNode.classList[4] !== 'react-to-post'
            ) history.push(`/p/${id}`);
          break;
        case 'post':
          if (e.target.classList[0] !== 'post-sender' && e.target.nodeName !== 'IMG') history.push(`/p/${id}`);
          break;
        case 'post-reaction':
          if (
            e.target.classList[4] !== 'react-to-post' &&
            e.target.nodeName !== 'TEXTAREA' && 
            e.target.nodeName !== 'IMG' &&
            e.target.nodeName !== 'path' &&
            e.target.nodeName !== 'svg' && 
            e.target.parentNode.nodeName !== 'FORM' && 
            e.target.parentNode.nodeName !== 'BUTTON' &&
            e.target.parentNode.classList[4] !== 'react-to-post'
          ) history.push(`/p/${id}`);
        break;
        default:
          break;
      }
    }
    
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
      newIndex > (props.media as any[]).length - 1
        ? (props.media as any[]).length - 1
        : newIndex
    );
  };
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
          {props.media && props.media.length && (
            <Fade in={true}>
              <LazyImg
                src={
                  JSON.parse((props.media as any[])[selectedMedia]).type ===
                  'raw'
                    ? '/images/file-icon.svg'
                    : JSON.parse((props.media as any[])[selectedMedia]).url
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
      <Box
        id={props.id}
        className='post-list-page mb-1 mb-md-2'
        borderRadius='2px'
        p={0}
        pt={1}
        pl={1}
        pb={props.sec_type === 'REPLY' ? 1 : 0}>
          <div onClick={navigate(
            (props.sec_type === 'REPLY'
              ? props.parent?.id
              : props.text
              ? props.id
              : props.parent?.id) as string, 'post'
          )}>
            {((props._extra && props.sec_type !== 'REPLY') ||
              (props.sec_type === 'REPOST' && !props.text)) &&
              !props.head && <small className='small-text'>{extra}</small>}
            {props.sec_type === 'REPLY' && !props.head && (
              <small className='small-text'>{extra}</small>
            )}
            <Row
              className={`container-fluid mx-auto ${
                props.sec_type === 'REPLY' ? 'pt-0' : ''
              } align-items-center p-2`}>
              <Avatar
                component='span'
                className='post-avatar'
                alt={
                  props.sec_type === 'REPLY'
                    ? props.parent?.sender_name
                    : props.text
                    ? props.sender_name
                    : props.parent?.sender_name
                }
                src={props.profile_photo ? props.profile_photo : `/images/${props.userAvatar}`}
              />
              <Col className='d-flex flex-column bio-post'>
                {props.sender_name ? (
                  <>
                    <Link to={`@${
                      props.sec_type === 'REPLY'
                      ? props.parent?.sender_username
                      : props.text
                      ? props.sender_username
                      : props.parent?.sender_username
                    }`} 
                      className='post-sender'>
                      {props.sec_type === 'REPLY'
                        ? props.parent?.sender_name
                        : props.text
                        ? props.sender_name
                        : props.parent?.sender_name}
                    </Link>
                    <Box component='div' color='#777'>
                      @
                      {props.sec_type === 'REPLY'
                        ? props.parent?.sender_username
                        : props.text
                        ? props.sender_username
                        : props.parent?.sender_username}
                    </Box>
                  </>
                ) : (
                  <>
                    <Skeleton width={150} />
                    <Skeleton width={100} />
                  </>
                )}
              </Col>
              <Col className='more-post-btn'>
                {/* <Box className='more d-none' component='span' borderRadius='100px'>
                  <svg
                    width='20'
                    height='6'
                    viewBox='0 0 20 6'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path
                      className='pathignore'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M3 5C1.89543 5 1 4.10457 1 3C1 1.89543 1.89543 1 3 1C4.10457 1 5 1.89543 5 3C5 4.10457 4.10457 5 3 5ZM10 5C8.89543 5 8 4.10457 8 3C8 1.89543 8.89543 1 10 1C11.1046 1 12 1.89543 12 3C12 4.10457 11.1046 5 10 5ZM17 5C15.8954 5 15 4.10457 15 3C15 1.89543 15.8954 1 17 1C18.1046 1 19 1.89543 19 3C19 4.10457 18.1046 5 17 5Z'
                      stroke='#666666'
                      strokeWidth='1.5'
                    />
                  </svg>
                </Box> */}
              </Col>
            </Row>
            {props.sender_name ? (
              <Row className='container-fluid  mx-auto'>
                <Box
                  component='div'
                  pt={1}
                  py={props.head ? 2 : undefined}
                  px={0}
                  ml={5}
                  width='100%'
                  fontSize={props.head ? '1.5rem' : undefined}
                  className='break-word'>
                  {processPostFn(
                    (props.sec_type === 'REPLY'
                      ? props.parent?.text
                      : props.text
                      ? props.text
                      : props.parent?.text) as string
                  )}
                </Box>
                {(props.media as any[]).length > 0 && (
                  <Box
                    pt={1}
                    px={0}
                    ml={5}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gridTemplateRows: `repeat(${
                        (props.media as any[]).length === 1
                          ? 2
                          : Math.ceil((props.media as any[]).length / 2)
                      }, 9rem)`,
                      gridAutoFlow: 'row',
                      columnGap: '0.2rem',
                      rowGap: '0.2rem'
                    }}>
                    {(props.media as any[]).map((m, i, self) => {
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
                              mData.type === 'raw'
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
                <Box
                  component='small'
                  textAlign='right'
                  width='100%'
                  color='#888'
                  pt={1}
                  mr={3}>
                  {formatDate(
                    (props.sec_type === 'REPLY'
                      ? props.parent?.posted_at
                      : props.text
                      ? props.posted_at
                      : props.parent?.posted_at) as number
                  )}
                </Box>
              </Row>
            ) : (
              <Box p={2} pl={3}>
                <Skeleton count={3} />
              </Box>
            )}
          </div>
        {props.sec_type === 'REPOST' && props.text && (
          <Box
            className='quoted-post'
            onClick={navigate(props.parent?.id as string, 'repost')}>
            <Row className='container-fluid px-2 mx-auto p-0 align-items-center'>
              <Avatar
                component='span'
                className='post-avatar'
                alt={props.parent?.sender_name}
                src={props.parent?.profile_photo ? props.parent?.profile_photo : `/images/${props.parent?.userAvatar}`}
              />
              <Col className='d-flex flex-grow-1 flex-column'>
                <Link  to={`@${props.parent?.sender_username}`} className='post-sender'>
                  {props.parent?.sender_name}
                </Link>
                <Box component='div' color='#777'>
                  @{props.parent?.sender_username}
                </Box>
              </Col>
            </Row>
            <Row className='container-fluid  mx-auto'>
              <Box component='div' pt={1} px={0} className='break-word'>
                {processPostFn(props.parent?.text as string)}
              </Box>
              <Box
                component='small'
                textAlign='right'
                width='100%'
                color='#888'
                pt={1}>
                {formatDate(props.parent?.posted_at as number)}
              </Box>
            </Row>
          </Box>
        )}
        {props.sender_name && (
          <Box 
            onClick={navigate(
              (props.sec_type === 'REPLY'
                ? props.parent?.id
                : props.text
                ? props.id
                : props.parent?.id) as string, 'post-reaction'
            )}
            py={1} 
            mt={1} 
            borderBottom='.5px solid #ddd'>
            <Row className='ml-3'>
              <Col
                xs={3}
                className='ml-auto d-flex align-items-center justify-content-center'>
                <ReactButton
                  id={
                    (props.sec_type === 'REPLY'
                      ? props.parent?.id
                      : props.text
                      ? props.id
                      : (props.parent?.id as string)) as string
                  }
                  reacted={
                    (props.sec_type === 'REPLY'
                      ? (props.parent?.reaction as 'NEUTRAL')
                      : props.text
                      ? (props.reaction as 'NEUTRAL')
                      : (props.parent?.reaction as 'NEUTRAL')) as 'NEUTRAL'
                  }
                  reactions={((): number => {
                    const upvotes: number = (props.sec_type === 'REPLY'
                      ? (props.parent?.upvotes as number)
                      : props.text
                      ? (props.upvotes as number)
                      : (props.parent?.upvotes as number)) as number;

                    return upvotes as number;
                  })()}
                  type='UPVOTE'
                />
              </Col>
              <Col
                xs={3}
                className='d-flex align-items-center justify-content-center'>
                <ReactButton
                  id={
                    (props.sec_type === 'REPLY'
                      ? props.parent?.id
                      : props.text
                      ? props.id
                      : (props.parent?.id as string)) as string
                  }
                  reacted={
                    (props.sec_type === 'REPLY'
                      ? (props.parent?.reaction as 'NEUTRAL')
                      : props.text
                      ? (props.reaction as 'NEUTRAL')
                      : (props.parent?.reaction as 'NEUTRAL')) as 'NEUTRAL'
                  }
                  reactions={((): number => {
                    const downvotes: number = (props.sec_type === 'REPLY'
                      ? (props.parent?.downvotes as number)
                      : props.text
                      ? (props.downvotes as number)
                      : (props.parent?.downvotes as number)) as number;

                    return downvotes as number;
                  })()}
                  type='DOWNVOTE'
                />
              </Col>
              <Col className='d-flex align-items-center justify-content-center'>
                <Box
                  padding='5px 15px'
                  onClick={openCreateRepostModal(
                    props.sec_type === 'REPLY'
                      ? (props.parent as any)
                      : props.text
                      ? (props as any)
                      : (props.parent as any)
                  )}
                  className='d-flex align-items-center react-to-post justify-content-center'
                  fontSize='13px'>
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 16 16'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path
                      className='pathignore'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M10.8069 13.3732H8.69944L9.55979 14.2581C9.77644 14.4747 9.77644 14.8261 9.55979 15.043L9.16723 15.4355C8.95058 15.6522 8.59921 15.6522 8.38233 15.4355L6.00312 12.9515C5.8897 12.838 5.83901 12.6881 5.84433 12.5395C5.83901 12.3909 5.8897 12.2409 6.00312 12.1275L8.40479 9.64339C8.62167 9.42674 8.9728 9.42674 9.18968 9.64339L9.58224 10.0359C9.79889 10.2526 9.79889 10.604 9.58224 10.8208L8.71333 11.7196H10.7185C12.313 11.7196 13.5923 10.4271 13.5923 8.83234V7.37065C13.5923 6.1543 12.8517 5.1185 11.7872 4.69331C11.7923 4.68636 11.7957 4.67942 11.8008 4.67247C11.5404 4.52943 11.3571 4.26255 11.3571 3.94429C11.3571 3.47951 11.7339 3.10269 12.1987 3.10269C12.3212 3.10269 12.436 3.13162 12.5408 3.17861C12.5415 3.17675 12.5424 3.17444 12.5429 3.17259C14.1335 3.84846 15.2489 5.42496 15.2489 7.26209V8.91798C15.2487 11.3713 13.26 13.3732 10.8069 13.3732ZM10.0838 4.06835L7.68192 6.55242C7.46527 6.76907 7.11391 6.76907 6.89726 6.55242L6.50447 6.15986C6.28782 5.94321 6.28782 5.59185 6.50447 5.37497L7.36644 4.48337H5.37099C3.77644 4.48337 2.48371 5.77586 2.48371 7.37065V8.83234C2.48371 10.1167 3.32809 11.1926 4.48772 11.5673C4.46736 11.5905 4.45046 11.6131 4.43055 11.6361C4.60091 11.79 4.71224 12.0071 4.71224 12.2548C4.71224 12.7195 4.33565 13.0964 3.87087 13.0964C3.73246 13.0964 3.60724 13.0549 3.4922 12.9957C3.49197 12.9959 3.49197 12.9959 3.49197 12.9961C1.91477 12.3145 0.809998 10.7458 0.809998 8.91821V7.26232C0.809998 4.80927 2.79873 2.82053 5.25179 2.82053H7.37246L6.52715 1.93797C6.3105 1.72132 6.3105 1.36995 6.52715 1.15307L6.91995 0.76051C7.1366 0.54386 7.48796 0.54386 7.70461 0.76051L10.0838 3.24457C10.1972 3.35799 10.2477 3.50798 10.2426 3.65658C10.2477 3.80495 10.1972 3.95494 10.0838 4.06835Z'
                      fill='#555'
                    />
                  </svg>

                  <Box padding='0 5px' fontSize='13px'>
                    {bigNumberFormat(
                      (props.sec_type === 'REPLY'
                        ? (props.parent?.reposts as number)
                        : props.text
                        ? (props.reposts as number)
                        : (props.parent?.reposts as number)) as number
                    )}
                  </Box>
                </Box>
              </Col>
              <Col className='d-flex align-items-center justify-content-center'>
                <Box
                  padding='5px 15px'
                  onClick={() => setShowComment(!showComment)}
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
                    {bigNumberFormat(
                      (props.sec_type === 'REPLY'
                        ? (props.parent?.replies as number)
                        : props.text
                        ? (props.replies as number)
                        : (props.parent?.replies as number)) as number
                    )}
                  </Box>
                </Box>
              </Col>
            </Row>
            {showComment && (
              <CreateReply
                post_id={`${
                  (props.sec_type === 'REPLY'
                    ? props.parent?.id
                    : props.text
                    ? props.id
                    : props.parent?.id) as string
                }`}
              />
            )}
          </Box>
        )}
        {props.sec_type === 'REPLY' && (
          <Box 
            className='inner-comment pl-5'
            onClick={navigate(props.id as string, 'reply')}>
            <Row className='container-fluid px-2 mx-auto p-0 align-items-center'>
              <Avatar
                component='span'
                className='post-avatar'
                alt={props.sender_name}
                src={props.profile_photo ? props.profile_photo : `/images/${props.userAvatar}`}
              />
              <Col className='d-flex flex-grow-1 flex-column'>
                <Link to={`@${props.sender_username}`} className='post-sender'>
                  {props.sender_name}
                </Link>
                <Box component='div' color='#777'>
                  @{props.sender_username}
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
                className='break-word'>
                {processPostFn(props.text as string)}
              </Box>
              <Box
                component='small'
                textAlign='right'
                width='100%'
                color='#888'
                pt={1}
                mr={3}>
                {formatDate(props.posted_at as number)}
              </Box>
            </Row>
            {props.sender_name && (
              <Box py={1} mt={1}>
                <Row className='ml-3'>
                  <Col
                    xs={3}
                    className='ml-auto d-flex align-items-center justify-content-center'>
                    <ReactButton
                      id={props.id as string}
                      reacted={props.reaction as 'NEUTRAL'}
                      reactions={props.upvotes as number}
                      type='UPVOTE'
                    />
                  </Col>
                  <Col
                    xs={3}
                    className='d-flex align-items-center justify-content-center'>
                    <ReactButton
                      id={props.id as string}
                      reacted={props.reaction as 'NEUTRAL'}
                      reactions={props.downvotes as number}
                      type='DOWNVOTE'
                    />
                  </Col>
                  <Col className='d-flex align-items-center justify-content-center'>
                    <Box
                      padding='5px 15px'
                      onClick={openCreateRepostModal(props)}
                      className='d-flex align-items-center react-to-post justify-content-center'
                      fontSize='13px'>
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 16 16'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'>
                        <path
                          className='pathignore'
                          fillRule='evenodd'
                          clipRule='evenodd'
                          d='M10.8069 13.3732H8.69944L9.55979 14.2581C9.77644 14.4747 9.77644 14.8261 9.55979 15.043L9.16723 15.4355C8.95058 15.6522 8.59921 15.6522 8.38233 15.4355L6.00312 12.9515C5.8897 12.838 5.83901 12.6881 5.84433 12.5395C5.83901 12.3909 5.8897 12.2409 6.00312 12.1275L8.40479 9.64339C8.62167 9.42674 8.9728 9.42674 9.18968 9.64339L9.58224 10.0359C9.79889 10.2526 9.79889 10.604 9.58224 10.8208L8.71333 11.7196H10.7185C12.313 11.7196 13.5923 10.4271 13.5923 8.83234V7.37065C13.5923 6.1543 12.8517 5.1185 11.7872 4.69331C11.7923 4.68636 11.7957 4.67942 11.8008 4.67247C11.5404 4.52943 11.3571 4.26255 11.3571 3.94429C11.3571 3.47951 11.7339 3.10269 12.1987 3.10269C12.3212 3.10269 12.436 3.13162 12.5408 3.17861C12.5415 3.17675 12.5424 3.17444 12.5429 3.17259C14.1335 3.84846 15.2489 5.42496 15.2489 7.26209V8.91798C15.2487 11.3713 13.26 13.3732 10.8069 13.3732ZM10.0838 4.06835L7.68192 6.55242C7.46527 6.76907 7.11391 6.76907 6.89726 6.55242L6.50447 6.15986C6.28782 5.94321 6.28782 5.59185 6.50447 5.37497L7.36644 4.48337H5.37099C3.77644 4.48337 2.48371 5.77586 2.48371 7.37065V8.83234C2.48371 10.1167 3.32809 11.1926 4.48772 11.5673C4.46736 11.5905 4.45046 11.6131 4.43055 11.6361C4.60091 11.79 4.71224 12.0071 4.71224 12.2548C4.71224 12.7195 4.33565 13.0964 3.87087 13.0964C3.73246 13.0964 3.60724 13.0549 3.4922 12.9957C3.49197 12.9959 3.49197 12.9959 3.49197 12.9961C1.91477 12.3145 0.809998 10.7458 0.809998 8.91821V7.26232C0.809998 4.80927 2.79873 2.82053 5.25179 2.82053H7.37246L6.52715 1.93797C6.3105 1.72132 6.3105 1.36995 6.52715 1.15307L6.91995 0.76051C7.1366 0.54386 7.48796 0.54386 7.70461 0.76051L10.0838 3.24457C10.1972 3.35799 10.2477 3.50798 10.2426 3.65658C10.2477 3.80495 10.1972 3.95494 10.0838 4.06835Z'
                          fill='#555'
                        />
                      </svg>

                      <Box padding='0 5px' fontSize='13px'>
                        {bigNumberFormat(props.reposts)}
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
                        {bigNumberFormat(props.replies)}
                      </Box>
                    </Box>
                  </Col>
                </Row>
                {showComment2 && <CreateReply post_id={props.id} />}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export default Post;
