import React, { useState } from 'react';

export const Img = (props: any) => {
  const [error, setError] = useState(false);
  const onError = (e: any) => {
    setError(true);
  };
  return (
    <img
      alt='Description goes here'
      {...props}
      src={props.src || 'undefined'}
      style={{ display: error ? 'none' : 'block' }}
      onError={onError}
    />
  );
};
