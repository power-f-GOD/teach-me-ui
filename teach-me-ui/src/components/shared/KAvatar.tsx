import React from 'react';
import Avatar from '@material-ui/core/Avatar';

import { dispatch } from '../../appStore';
import { displayGallery } from '../../actions';

const KAvatar = (props: {
  src?: string;
  alt?: string;
  className?: string;
  component?: string;
}) => {
  const { src, alt, className, ...other } = props;

  const [error, setError] = React.useState(false);

  const handleImageLoadEvent = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => ((e.target as any).ariaHidden = false);

  return (
    <Avatar
      component='span'
      {...other}
      className={`k-avatar ${className} ${error || !src ? 'no-image' : ''}`}
      alt={alt}
      src={src}
      imgProps={{
        'aria-hidden': true,
        className: 'cursor-pointer',
        onLoad: handleImageLoadEvent,
        onError: (e) => {
          setError(true);
          handleImageLoadEvent(e);
        },
        onClick: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
          e.preventDefault();
          e.stopPropagation();
          dispatch(
            displayGallery({
              open: true,
              hasExtra: false,
              data: [{ type: 'image', url: src }]
            })
          );
        }
      }}
    />
  );
};

export default KAvatar;
