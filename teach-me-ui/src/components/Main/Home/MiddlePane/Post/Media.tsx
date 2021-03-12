import React from 'react';
import axios from 'axios';
import { LazyLoadImage as LazyImg } from 'react-lazy-load-image-component';
import ReactPlayer from 'react-player/lazy';

import Box from '@material-ui/core/Box';
import { dispatch } from '../../../../../appStore';
import { displayGallery } from '../../../../../actions';
import { MediaDataProp } from '../../../../../types';

const Media = ({ media }: { media?: string[] }) => {
  return (media?.length || 0) > 0 ? (
    <Box
      className='media-container'
      style={{
        display: media?.length === 1 ? 'block' : 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: `repeat(${
          media?.length === 1 ? 2 : Math.ceil((media as any[]).length / 2)
        }, 14em)`,
        gridAutoFlow: 'row',
        columnGap: '0.2em',
        rowGap: '0.2em'
      }}>
      {media?.map((medium, i, self) => {
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

        const mData: MediaDataProp = JSON.parse(medium);
        const isLocalHost = /localhost/.test(window.location.origin);
        const url =
          mData.type === 'raw'
            ? '/images/file-icon.svg'
            : mData.type === 'video'
            ? isLocalHost
              ? '/videos/' +
                (i % 2 === 0 ? 'nature-video.mp4' : 'nature-trailer.mp4') // for dev/testing purpose (in order to save data on every save/reload)
              : mData.url
            : mData.url;

        return (
          <div key={i} style={style}>
            {(() => {
              switch (mData.type) {
                case 'video':
                  return (
                    <ReactPlayer
                      width='100%'
                      height='22em'
                      style={{ maxHeight: '100%' }}
                      controls={true}
                      config={{
                        file: {
                          attributes: {
                            muted: true,
                            autoPlay: true,
                            controlsList: 'nodownload',
                            disablePictureInPicture: true,
                            onClick: (e: Event) => {
                              const video = e.currentTarget as HTMLVideoElement;

                              dispatch(
                                displayGallery({
                                  open: true,
                                  data: media.map((medium, i) =>
                                    medium.replace(
                                      /(url":")([^"]*)(",)/,
                                      `$1${
                                        isLocalHost
                                          ? i % 2 === 0
                                            ? '/videos/nature-video.mp4'
                                            : '/videos/nature-trailer.mp4'
                                          : '$2'
                                      }#t=${video.currentTime}$3`
                                    )
                                  ),
                                  startIndex: i
                                })
                              );
                              // mute current Post video while video in Gallery will be playing
                              setTimeout(() => {
                                if (/g=1/.test(window.location.hash) && video) {
                                  video.muted = true;
                                  video.play();
                                }
                              }, 10);
                            }
                          }
                        }
                      }}
                      url={url}
                    />
                  );
                case 'image':
                  return (
                    <LazyImg
                      id={i.toString()}
                      onClick={() => {
                        if (mData.type === 'raw' && 2 > 3) {
                          axios({
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
                      alt='post image'
                      data-hide='true'
                      onLoad={(e) => ((e.target as any).dataset.hide = 'false')}
                    />
                  );
                case 'document':
                case 'raw':
                  return <></>;
              }
            })()}
          </div>
        );
      })}
    </Box>
  ) : null;
};

export default Media;
