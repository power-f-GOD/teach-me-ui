import React from 'react';

export default function createMemo() {
  return React.memo((props: any) => {
    let Component = props.memoizedComponent.component;
    let ref;
    let _props;

    if (Component) {
      ref = props.memoizedComponent.ref;
    } else {
      Component = props.memoizedComponent;
      ref = null;
    }

    if (!Component) {
      throw Error(
        "You're probably missing the 'memoizedComponent' prop for Memoize."
      );
    }
    
    _props = { ...props };

    delete _props.memoizedComponent;
    return ref ? (
      <Component {..._props} ref={ref} />
    ) : (
      <Component {..._props} />
    );
  });
}
