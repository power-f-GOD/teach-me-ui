import React, { useEffect, useState, useCallback } from 'react';
import ImageGallery, { ReactImageGalleryItem } from 'react-image-gallery';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import ReactPlayer from 'react-player/lazy';

import Container from 'react-bootstrap/Container';

import IconButton from '@material-ui/core/IconButton';
import MuiModal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import CloseIcon from '@material-ui/icons/Close';

import { delay, dispatch } from '../../utils';
import { GalleryProps, MediaType } from '../../types';
import { displayGallery } from '../../actions';

const Gallery = (props: {
  gallery: GalleryProps;
  windowWidth: number;
  location: Location;
}) => {
  const {
    gallery: { open, data, startIndex, hasExtra },
    windowWidth
  } = props;
  const numOfMedia = data?.length;

  const [willClose, setWillClose] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const history = useHistory();

  const handleClose = useCallback(() => {
    if (open) {
      // remove event listener to prevent redundant calls and weird behaviours
      window.removeEventListener('popstate', checkOpenState);
      setWillClose(true);
      delay(300).then(() => {
        dispatch(displayGallery({ open: false }));
      });

      if (/g=1/.test(window.location.hash)) {
        history.goBack();
      }
    }
    //eslint-disable-next-line
  }, [open, startIndex]);

  const checkOpenState = useCallback(() => {
    handleClose();
  }, [handleClose]);

  useEffect(() => {
    if (/g=1|modal/.test(window.location.hash)) {
      history.goBack();
    }
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    setCurrentIndex(startIndex! > numOfMedia! - 1 ? 0 : startIndex);
  }, [startIndex, numOfMedia]);

  useEffect(() => {
    if (open) {
      window.addEventListener('popstate', checkOpenState);
    }
  }, [checkOpenState, open]);

  useEffect(() => {
    if (open) {
      setWillClose(false);
      history.push(window.location.pathname + '#g=1');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [open, history]);

  return (
    <MuiModal
      aria-labelledby='spring-modal-title'
      aria-describedby='spring-modal-description'
      className={`Gallery fade-in-opacity ${willClose ? 'fade-out' : ''} ${
        hasExtra ? 'has-extra' : ''
      } d-flex justify-content-center align-content-center`}
      open={open || false}
      onClose={handleClose}
      closeAfterTransition
      disableScrollLock
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 100 }}>
      <div>
        <IconButton
          edge='start'
          className='close-modal-button slide-in-top'
          color='inherit'
          onClick={handleClose}
          aria-label='close modal'>
          <CloseIcon fontSize='large' />
        </IconButton>
        <Container fluid className='image-gallery-container px-0'>
          <ImageGallery
            items={
              (data ?? []).map((_datum, i) => {
                const datum = { ..._datum } as ReactImageGalleryItem & {
                  type: MediaType;
                };

                if (datum.type === 'video') {
                  datum.renderItem = (props) => (
                    <ReactPlayer
                      url={props.original}
                      width='100%'
                      height='22em'
                      style={{ maxHeight: 'calc(100vh - 4.5em)' }}
                      controls={true}
                      loop={true}
                      config={{
                        file: {
                          attributes: {
                            autoPlay: currentIndex === i,
                            controlsList: 'nodownload',
                            disablePictureInPicture: true
                          }
                        }
                      }}
                      playing={currentIndex === i}
                    />
                  );
                }

                datum.thumbnail =
                  datum.thumbnail
                    ?.replace(/h_250/, 'h_75')
                    .replace(/w_250/, 'w_90') || datum.original;

                return datum;
              }) as ReactImageGalleryItem[]
            }
            showPlayButton={false}
            showIndex={hasExtra}
            startIndex={currentIndex || 0}
            additionalClass={
              windowWidth < 768 || !hasExtra ? 'fade-in' : 'slide-in-left'
            }
            infinite={false}
            onClick={(e) => {
              if (!/A|BUTTON|IMG|VIDEO/i.test((e as any).target.tagName)) {
                handleClose();
              }
            }}
            onSlide={(currentIndex) => {
              setCurrentIndex(currentIndex);
            }}
          />
          {hasExtra && (
            <Container
              as='aside'
              className={`${
                windowWidth < 768 ? 'fade-in' : 'slide-in-right'
              } p-3`}>
              Post or Extra
              <br />
              <br /> contents <br />
              <br /> goes <br />
              <br /> here
            </Container>
          )}
        </Container>
      </div>
    </MuiModal>
  );
};

export default connect(
  (state: { gallery: GalleryProps; windowWidth: number }) => ({
    gallery: state.gallery,
    windowWidth: state.windowWidth
  })
)(Gallery);
