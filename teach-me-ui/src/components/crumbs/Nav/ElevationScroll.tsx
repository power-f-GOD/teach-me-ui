import React from 'react';

import useScrollTrigger from '@material-ui/core/useScrollTrigger';

export default function ElevationScroll(props: {
  children: React.ReactElement;
  forLandingPage: boolean;
}) {
  const { children, forLandingPage } = props;

  let trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 60
  });

  return React.cloneElement(children, {
    elevation: trigger ? 8 : 0,
    className: trigger || !forLandingPage ? 'nav-background' : ''
  });
}
