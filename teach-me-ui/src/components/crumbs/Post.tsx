import React, { useState } from 'react';

import Axios from 'axios';

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

import { dispatch, formatDate } from '../../functions/utils';
import { PostPropsState } from '../../constants/interfaces';

import { displayModal } from '../../functions';
import { triggerSearchKanyimuta } from '../../actions/search';

import { LazyLoadImage as LazyImg } from 'react-lazy-load-image-component';

import { PostFooter } from './Post.crumbs';

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

export const openCreateRepostModal = (meta: any) => (e: any) => {
  displayModal(true, false, 'CREATE_REPOST', {
    title: 'Create Repost',
    post: meta
  });
};

const Post: React.FunctionComponent<
  Partial<PostPropsState> & Partial<{ head: boolean }>
> = (props) => {
  const {
    type,
    media,
    sec_type,
    sender_name,
    _extra,
    id,
    text,
    parent,
    profile_photo,
    // userAvatar,
    sender_username,
    posted_at,
    upvotes: _upvotes,
    downvotes: _downvotes,
    reaction,
    reposts,
    replies,
    child
  } = props;

  const history = useHistory();
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

  if (child?.sec_type === 'REPOST') {
    extra = `${child.sender_name} reposted`;
  }

  if (_extra) {
    switch (_extra.type) {
      case 'UPVOTE':
        extra = `${_extra?.colleague_name} upvoted`;
        break;
    }
  }

  if (child?.sec_type === 'REPLY') {
    extra = `${child.sender_name} replied`;

    extra +=
      sender_username === child.sender_username
        ? ' his own post'
        : sender_name + "'s post";
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
      <Box id={id} className={type === 'reply' ? 'Reply' : 'Post'}>
        {extra && <small className='extra'>{extra}</small>}

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
            <Box component='div' onClick={navigate(id!)} className='text'>
              {processPostFn(text!)}
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
            <PostFooter
              id={id}
              text={text}
              upvotes={_upvotes}
              downvotes={_downvotes}
              reaction={reaction}
              reposts={reposts}
              replies={replies}
              repostMeta={parent || props}
              anchorIsParent={!!child}
              openCreateRepostModal={openCreateRepostModal}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default Post;
