import React from 'react';

export default function createMemo() {
  return React.memo((props: any) => {
    const Component = props.memoizedComponent;
    let _props = { ...props };

    if (!Component) {
      throw Error(
        "You're probably missing the 'memoizedComponent' prop for Memoize."
      );
    }

    delete _props.memoizedComponent;
    return <Component {..._props} />;
  });
}