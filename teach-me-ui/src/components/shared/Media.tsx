import React, { useCallback } from 'react';
import axios from 'axios';
import { LazyLoadImage as LazyImg } from 'react-lazy-load-image-component';
import ReactPlayer from 'react-player/lazy';

import Container from 'react-bootstrap/Container';

import Box from '@material-ui/core/Box';

import { dispatch } from '../../appStore';
import { displayGallery } from '../../actions';
import { MediaProps } from '../../types';
import { userDeviceIsMobile } from '../..';

import MediaDocument from './Media.Document';

const Media = ({ media }: { media?: MediaProps[] }) => {
  const handleVideoClick = useCallback(
    (media: MediaProps[], videoIndex: number, isLocalHost: boolean) => (
      e: React.MouseEvent<HTMLElement, MouseEvent>
    ) => {
      let video = e.currentTarget as HTMLVideoElement;

      if (video.tagName !== 'VIDEO') {
        video = video.querySelector('video')!;
      }

      if (!video) return;

      dispatch(
        displayGallery({
          open: true,
          data: media.map((medium, i) => {
            const url =
              isLocalHost && medium.type === 'video'
                ? '/videos/' +
                  (i % 2 === 0 ? 'nature-video.mp4' : 'nature-trailer.mp4') // for dev/testing purpose (in order to save data on every save/reload)
                : medium.url;

            return {
              ...medium,
              url:
                medium.type === 'video' ? `${url}#t=${video.currentTime}` : url
            };
          }),
          startIndex: videoIndex
        })
      );
      // mute current Post video while video in Gallery will be playing
      setTimeout(() => {
        if (/g=1/.test(window.location.hash) && video) {
          video.muted = true;
          video.play();
        }
      }, 10);
    },
    []
  );

  // console.log(media);

  if (!media?.length) return null;

  return (
    <Box className={`Media has-${media.length}-media`}>
      {media.map((medium, i) => {
        if (i + 1 > 4) return null;

        const isLocalHost = /localhost/.test(window.location.origin);
        const isDoc = /doc|raw/.test(medium.type);
        const url =
          medium.type === 'raw'
            ? '/images/file-icon.svg'
            : medium.type === 'video' && isLocalHost
            ? '/videos/' +
              (i % 2 === 0 ? 'nature-video.mp4' : 'nature-trailer.mp4') // for dev/testing purpose (in order to save data on every save/reload)
            : medium.url;
        // console.log(medium);
        return (
          <Box
            key={i}
            className={isDoc ? 'is-doc' : ''}
            onClick={
              medium.type === 'video' && userDeviceIsMobile
                ? handleVideoClick(media, i, isLocalHost)
                : undefined
            }>
            {/* Hack to by media onClick event prevention for videos on mobile devices */}
            {userDeviceIsMobile && medium.type === 'video' && (
              <Container className='video-overlay__mobile--hack' />
            )}

            {(() => {
              switch (medium.type) {
                case 'video':
                  return (
                    <ReactPlayer
                      width='100%'
                      height='25em'
                      style={{ maxHeight: '100%' }}
                      controls={true}
                      url={url}
                      config={{
                        file: {
                          attributes: {
                            muted: true,
                            autoPlay: true,
                            loop: true,
                            controlsList: 'nodownload',
                            disablePictureInPicture: true,
                            onClick: !userDeviceIsMobile
                              ? handleVideoClick(media, i, isLocalHost)
                              : undefined
                          }
                        }
                      }}
                    />
                  );
                case 'document':
                case 'raw':
                  return (
                    <MediaDocument
                      title={medium.title}
                      mime_type={medium.mime_type}
                    />
                  );
                case 'image':
                  return (
                    <LazyImg
                      onClick={() => {
                        if (medium.type === 'raw' && 2 > 3) {
                          axios({
                            url: medium.url,
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
                        } else {
                          dispatch(
                            displayGallery({
                              open: true,
                              data: media,
                              startIndex: i
                            })
                          );
                        }
                      }}
                      src={url}
                      alt={medium.title}
                      data-hide='true'
                      onLoad={(e) => ((e.target as any).dataset.hide = 'false')}
                      onError={(e) => ((e.target as any).src = url)}
                    />
                  );
              }
            })()}

            {i === 3 && media.length > 4 && (
              <Container className='more-media-overlay px-0'>
                <Container as='span' className='px-0 w-auto'>
                  +1
                </Container>
              </Container>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default Media;
