import React, { useCallback } from 'react';
import axios from 'axios';
import { LazyLoadImage as LazyImg } from 'react-lazy-load-image-component';
import ReactPlayer from 'react-player/lazy';

import Box from '@material-ui/core/Box';
import { dispatch } from '../../appStore';
import { displayGallery } from '../../actions';
import { MediaProps } from '../../types';
import { userDeviceIsMobile } from '../..';
import { FAIcon } from './Icons';

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
        let fileIconName = 'word';

        switch (true) {
          case /presentation/.test(medium.mime_type):
            fileIconName = 'powerpoint';
            break;
          case /pdf/.test(medium.mime_type):
            fileIconName = 'pdf';
            break;
          case /sheet/.test(medium.mime_type):
            fileIconName = 'excel';
            break;
          case /te?xt/.test(medium.mime_type):
            fileIconName = 'alt';
            break;
        }

        return (
          <div
            key={i}
            className={isDoc ? 'is-doc' : ''}
            onClick={
              medium.type === 'video' && userDeviceIsMobile
                ? handleVideoClick(media, i, isLocalHost)
                : undefined
            }>
            {/* Hack to by media onClick event prevention for videos on mobile devices */}
            {userDeviceIsMobile && medium.type === 'video' && (
              <div className='video-overlay__mobile--hack'></div>
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
                case 'image':
                  return (
                    <>
                      {isDoc && (
                        <div className='media-title__file d-flex'>
                          <FAIcon
                            name={'file-' + fileIconName}
                            className='m-2'
                            fontSize='2.125em'
                          />
                          <div className='d-flex flex-column align-self-center'>
                            <span className='font-bold'>{medium.title}</span>
                            <small className='theme-tertiary-lightest'>
                              Size: 8KB
                            </small>
                          </div>
                        </div>
                      )}
                      <LazyImg
                        id={i.toString()}
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
                        src={isDoc ? medium.thumbnail : url}
                        alt={medium.title}
                        data-hide='true'
                        onLoad={(e) =>
                          ((e.target as any).dataset.hide = 'false')
                        }
                        onError={(e) => ((e.target as any).src = url)}
                      />
                    </>
                  );
              }
            })()}

            {i === 3 && media.length > 4 && (
              <div className='more-media-overlay'>
                <span>+1</span>
              </div>
            )}
          </div>
        );
      })}
    </Box>
  );
};

export default Media;
