import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';

import Skeleton from 'react-loading-skeleton';

import { Link } from 'react-router-dom';

import ReactButton from './ReactButton';
import { bigNumberFormat } from '../../functions/utils';
import { PostPropsState } from '../../constants/interfaces';

export const processPostFn = (post: string) =>
  post &&
  post.split(/(\s(?=[#@])|(?=< [#@]\w+)\s)/).map((w, i) => {
    return /(^@|^#)/.test(w) ? (
      <Link key={i} to={`/${w}`}>
        {w}
      </Link>
    ) : (
      w
    );
  });

const Post: React.FunctionComponent<Partial<PostPropsState>> = (props) => {
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

  return (
    <Box
      className='post-list-page'
      borderRadius='5px'
      p={0}
      pt={1}
      pl={1}
      pb={props.sec_type === 'REPLY' ? 1 : 0}
      mb={1}>
      {((props._extra && props.sec_type !== 'REPLY') ||
        (props.sec_type === 'REPOST' && !props.text)) && (
        <small className='small-text'>{extra}</small>
      )}
      {props.sec_type === 'REPLY' && (
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
          src={`/images/${props.userAvatar}`}
        />
        <Col className='d-flex flex-column bio-post'>
          {props.sender_name ? (
            <>
              <Box component='div' fontWeight='bold'>
                {props.sec_type === 'REPLY'
                  ? props.parent?.sender_name
                  : props.text
                  ? props.sender_name
                  : props.parent?.sender_name}
              </Box>
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
          <Box className='more' component='span' borderRadius='100px'>
            <svg
              width='20'
              height='6'
              viewBox='0 0 20 6'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'>
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M3 5C1.89543 5 1 4.10457 1 3C1 1.89543 1.89543 1 3 1C4.10457 1 5 1.89543 5 3C5 4.10457 4.10457 5 3 5ZM10 5C8.89543 5 8 4.10457 8 3C8 1.89543 8.89543 1 10 1C11.1046 1 12 1.89543 12 3C12 4.10457 11.1046 5 10 5ZM17 5C15.8954 5 15 4.10457 15 3C15 1.89543 15.8954 1 17 1C18.1046 1 19 1.89543 19 3C19 4.10457 18.1046 5 17 5Z'
                stroke='#666666'
                strokeWidth='1.5'
              />
            </svg>
          </Box>
        </Col>
      </Row>
      {props.sender_name ? (
        <Row className='container-fluid  mx-auto'>
          <Box component='div' pt={1} px={0} ml={5} className='break-word'>
            {processPostFn(
              (props.sec_type === 'REPLY'
                ? props.parent?.text
                : props.text
                ? props.text
                : props.parent?.text) as string
            )}
          </Box>
        </Row>
      ) : (
        <Box p={2} pl={3}>
          <Skeleton count={3} />
        </Box>
      )}
      {props.sec_type === 'REPOST' && props.text && (
        <Box className='quoted-post'>
          <Row className='container-fluid px-2 mx-auto p-0 align-items-center'>
            <Avatar
              component='span'
              className='post-avatar'
              alt={props.sender_name}
              src={`/images/${props.userAvatar}`}
            />
            <Col className='d-flex flex-grow-1 flex-column'>
              <Box component='div' fontWeight='bold'>
                {props.parent?.sender_name}
              </Box>
              <Box component='div' color='#777'>
                @{props.parent?.sender_username}
              </Box>
            </Col>
          </Row>
          <Row className='container-fluid  mx-auto'>
            <Box component='div' pt={1} px={0} className='break-word'>
              {processPostFn(props.parent?.text as string)}
            </Box>
          </Row>
        </Box>
      )}
      {props.sender_name && (
        <Box py={1} mt={1} borderBottom='.5px solid #ddd'>
          <Row className='ml-3'>
            <Col className='d-flex align-items-center justify-content-center'>
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
            <Col className='d-flex align-items-center justify-content-center'>
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
                className='d-flex align-items-center react-to-post justify-content-center'
                fontSize='13px'>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path
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
                className='d-flex align-items-center react-to-post justify-content-center'
                fontSize='13px'>
                <svg
                  width='15'
                  height='15'
                  viewBox='0 0 15 15'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path
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
        </Box>
      )}
      {props.sec_type === 'REPLY' && (
        <Box className='inner-comment pl-5'>
          <Row className='container-fluid px-2 mx-auto p-0 align-items-center'>
            <Avatar
              component='span'
              className='post-avatar'
              alt={props.sender_name}
              src={`/images/${props.userAvatar}`}
            />
            <Col className='d-flex flex-grow-1 flex-column'>
              <Box component='div' fontWeight='bold'>
                {props.sender_name}
              </Box>
              <Box component='div' color='#777'>
                @{props.sender_username}
              </Box>
            </Col>
          </Row>
          <Row className='container-fluid  mx-auto'>
            <Box component='div' pt={1} px={0} ml={5} className='break-word'>
              {processPostFn(props.text as string)}
            </Box>
          </Row>
          {props.sender_name && (
            <Box py={1} mt={1}>
              <Row className='ml-3'>
                <Col className='d-flex align-items-center justify-content-center'>
                  <ReactButton
                    id={props.id as string}
                    reacted={props.reaction as 'NEUTRAL'}
                    reactions={props.upvotes as number}
                    type='UPVOTE'
                  />
                </Col>
                <Col className='d-flex align-items-center justify-content-center'>
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
                    className='d-flex align-items-center react-to-post justify-content-center'
                    fontSize='13px'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 16 16'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'>
                      <path
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
                    className='d-flex align-items-center react-to-post justify-content-center'
                    fontSize='13px'>
                    <svg
                      width='15'
                      height='15'
                      viewBox='0 0 15 15'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'>
                      <path
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
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Post;
