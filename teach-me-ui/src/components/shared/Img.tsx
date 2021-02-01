import React, { useState } from 'react';

export const Img = (props: any) => {
  const [error, setError] = useState(false);
  const onError = (e: Event) => {
    setError(true);
  };

  return (
    <img
      alt='Description goes here'
      {...props}
      aria-hidden={error}
      className={`${props.className} d-block ${
        error ? 'hide' : 'show'
      }`}
      src={props.src || 'undefined'}
      onError={onError}
    />
  );
};
