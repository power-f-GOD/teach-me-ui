import React, { useState } from 'react';

export default (props: any) => {
  const [error, setError] = useState(false);
  const onError = (e: any) => {
    console.log('image error occurred');
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
