import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';

import Axios from 'axios';

import Row from 'react-bootstrap/Row';

import Box from '@material-ui/core/Box';
import { PostStateProps } from '../../../../../types';

import { LazyLoadImage as LazyImg } from 'react-lazy-load-image-component';

import QuotedPost from './QuotedPost';
import { processPost } from '.';
import TextTruncator from '../../../../shared/TextTruncator';

interface PostBodyProps {
  isLoading: boolean;
  quote?: PostStateProps;
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
    quote,
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
    (id: string) => () => {
      if (2 > 3) history.push(`/p/${id}`);
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
        {quote && <QuotedPost {...quote} navigate={navigate} key={quote.id} />}

        <Box
          component='div'
          onClick={navigate(id!)}
          className={`text ${!text?.trim() ? 'py-2' : ''}`}
          data-id={id}>
          {processPost(text!)}
          <TextTruncator lineClamp={8} anchorEllipsis={true} />
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
                media?.length === 1 ? 2 : Math.ceil((media as any[]).length / 2)
              }, 12rem)`,
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
                    alt='post image'
                    style={{ opacity: 0 }}
                    onLoad={(e) => ((e.target as any).style.opacity = 1)}
                  />
                </div>
              );
            })}
          </Box>
        )}
      </Row>
    );

  return (
    <Box className='mt-1 px-2 pt-2 pb-0'>
      {((index ?? 0) % 2 === 0 || index === 1) && index !== 0 ? (
        <Skeleton height='12rem' className='media' />
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
