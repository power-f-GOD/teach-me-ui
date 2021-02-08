import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';

import Row from 'react-bootstrap/Row';

import Box from '@material-ui/core/Box';
import { PostStateProps } from '../../../../../types';

import QuotedPost from './QuotedPost';
import { processPost } from '.';
import TextTruncator from '../../../../shared/TextTruncator';
import Media from './Media';

interface PostBodyProps {
  head?: boolean;
  isLoading: boolean;
  parent?: Partial<PostStateProps>;
  post_id: string;
  text: string;
  index?: number;
  reposts?: Partial<PostStateProps>[];
  media?: any[];
  setMediaPreview: Function;
  setSelectedMedia: Function;
}

const PostBody = (props: PostBodyProps) => {
  const {
    isLoading,
    parent: quote,
    post_id: id,
    text,
    index,
    reposts,
    media,
    setMediaPreview,
    setSelectedMedia
  } = props;

  const history = useHistory();

  const navigate = useCallback(
    (id: string, head?: boolean) => () => {
      if (head) return;

      history.push(`/p/${id}`);
    },
    [history]
  );

  const showModal = useCallback(
    (e: any) => {
      setSelectedMedia(parseInt(e.target.id));
      setMediaPreview(true);
    },
    [setSelectedMedia, setMediaPreview]
  );

  if (!isLoading)
    return (
      <Row className='post-body'>
        {/* Post repost */}
        {quote && (
          <QuotedPost
            {...quote}
            navigate={navigate}
            showModal={showModal}
            key={quote.id}
          />
        )}

        <Box
          component='div'
          onClick={navigate(id!, props.head)}
          className={`text ${!text?.trim() ? 'py-2' : ''}`}
          data-id={id}>
          {processPost(text!)}
          <TextTruncator lineClamp={8} anchorEllipsis={true} />
        </Box>

        <Media media={media} showModal={showModal} />

        {/* {sec_type === 'REPOST' &&
        text && */}
        {!quote &&
          reposts
            ?.filter((repost) => (reposts.length > 5 ? repost.text : repost))
            .slice(0, 5)
            .map((repost) => (
              <QuotedPost
                {...repost}
                navigate={navigate}
                showModal={showModal}
                key={repost.id}
              />
            ))}
      </Row>
    );

  return (
    <Box className='mt-1 px-2 pt-2 pb-0'>
      {((index ?? 0) % 2 === 0 || index === 1) && index !== 0 ? (
        <Skeleton height='13rem' className='media' />
      ) : (
        <>
          <Skeleton height='1rem' width='50%' className='ml-1 mb-2' />
          <Skeleton height='1rem' width='85%' className='ml-1 mb-2' />
          <Skeleton height='1rem' width='60%' className='ml-1 mb-2' />
          <Skeleton
            height='1rem'
            width='20%'
            className='d-block ml-1 mt-1 mb-2'
          />
        </>
      )}
    </Box>
  );
};

export default PostBody;
