import React, { useState } from 'react';
import { dispatch } from '../../appStore';
import { displayGallery } from '../../actions';

export const Img = (props: {
  src: string;
  alt?: string;
  className?: string;
}) => {
  const { src, alt, className } = props;

  const [error, setError] = useState(false);

  const onError = (e: Event | any) => {
    setError(true);
  };

  const handleImageLoadEvent = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => ((e.target as any).ariaHidden = false);

  return (
    <img
      alt={alt}
      aria-hidden={true}
      className={`${className} d-block ${error ? 'hide' : 'show'}`}
      src={src}
      onLoad={handleImageLoadEvent}
      onError={onError}
      onClick={() => {
        dispatch(
          displayGallery({
            open: true,
            hasExtra: false,
            data: [{ type: 'image', url: src }]
          })
        );
      }}
    />
  );
};
