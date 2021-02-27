import React, { useEffect, useState } from 'react';
import ImageGallery, { ReactImageGalleryItem } from 'react-image-gallery';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';

import IconButton from '@material-ui/core/IconButton';
import MuiModal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import CloseIcon from '@material-ui/icons/Close';

import { delay, dispatch } from '../../utils';
import { GalleryProps } from '../../types';
import { displayGallery } from '../../actions';

const Gallery = (props: { gallery: GalleryProps; windowWidth: number }) => {
  const {
    gallery: { open, data, startIndex, hasExtra },
    windowWidth
  } = props;
  const [willClose, setWillClose] = useState(false);

  const handleClose = () => {
    setWillClose(true);
    delay(300).then(() => {
      dispatch(displayGallery({ open: false }));
    });
  };

  useEffect(() => {
    if (open) {
      setWillClose(false);
      document.body.style.overflow = 'hidden';
    } else document.body.style.overflow = 'auto';
  }, [open]);

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
      BackdropProps={{
        timeout: 100
      }}>
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
            items={(data ?? []) as ReactImageGalleryItem[]}
            showPlayButton={false}
            showIndex={hasExtra}
            startIndex={startIndex || 0}
            additionalClass={
              windowWidth < 768 || !hasExtra ? 'fade-in' : 'slide-in-left'
            }
            onClick={(e) => {
              if (!/A|BUTTON|IMG/.test((e as any).target.tagName)) {
                handleClose();
              }
            }}
          />
          {hasExtra && (
            <Container
              as='aside'
              className={`${
                windowWidth < 768 ? 'slide-in-bottom' : 'slide-in-right'
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
