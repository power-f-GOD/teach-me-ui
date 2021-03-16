import React from 'react';

import Container from 'react-bootstrap/Container';

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import { FAIcon } from './Icons';

const MediaDocument = (props: {
  title: string;
  mime_type: string;
  isThumbnail?: boolean;
  isGallery?: boolean;
}) => {
  const { title, mime_type, isThumbnail, isGallery } = props;
  let fileIconName = '';

  switch (true) {
    case /document/.test(mime_type):
      fileIconName = 'word';
      break;
    case /presentation/.test(mime_type):
      fileIconName = 'powerpoint';
      break;
    case /sheet/.test(mime_type):
      fileIconName = 'excel';
      break;
    case /pdf/.test(mime_type):
      fileIconName = 'pdf';
      break;
    default:
      fileIconName = 'alt';
  }

  return (
    <Container
      as={isThumbnail ? 'span' : 'div'}
      className={`MediaDocument ${fileIconName} ${
        isThumbnail ? 'is-thumbnail' : ''
      } ${isGallery ? 'is-gallery' : ''} h-100 d-flex px-0 mx-0`}>
      {!isThumbnail && (
        <Box
          component={isThumbnail ? 'span' : 'div'}
          className='media-document__title d-flex'>
          <FAIcon
            name={'file-' + fileIconName}
            className='m-2'
            fontSize='2.125em'
          />
          <Container
            as={isThumbnail ? 'span' : 'div'}
            className='d-flex flex-column align-self-center px-0'>
            <Container as='span' className='font-bold pl-0'>
              {title}
            </Container>
            <Container as='small' className='theme-tertiary-lightest px-0'>
              Size: 8KB
            </Container>
          </Container>
        </Box>
      )}
      <Container
        as={isThumbnail ? 'span' : 'div'}
        className='media-document__background flex-column'>
        <FAIcon
          name={'file-' + fileIconName}
          fontSize={isThumbnail ? '1.75em' : '4.25em'}
        />
        {!isThumbnail && (
          <Button
            variant='contained'
            size='small'
            className='btn-white px-2 px-md-3 py-1 mt-3'
            color='default'>
            <FAIcon name='download' className='mr-2 my-1' /> Save
          </Button>
        )}
      </Container>
    </Container>
  );
};

export default React.memo(MediaDocument);
