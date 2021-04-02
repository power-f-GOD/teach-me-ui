import React from 'react';

import useScrollTrigger from '@material-ui/core/useScrollTrigger';

export default function ElevationScroll(props: {
  children: React.ReactElement;
  canTransparentizeNavBar: boolean;
  windowWidth: number;
  location: Location;
  isAuthenticated: boolean;
}) {
  const {
    children,
    canTransparentizeNavBar,
    windowWidth,
    location,
    isAuthenticated
  } = props;
  const atFeedsOrPost =
    (/^\/(home|index)?$/.test(location.pathname) && isAuthenticated) ||
    /^\/p\//.test(location.pathname);
  const disableHysteresis = !atFeedsOrPost || windowWidth >= 768;

  const trigger = useScrollTrigger({
    disableHysteresis,
    threshold: 60
  });

  if (atFeedsOrPost && windowWidth < 768) {
    document.body.dataset.hideNav = '' + trigger;
  } else if (document.body.dataset.hideNav === 'true') {
    document.body.dataset.hideNav = 'false';
  }

  return React.cloneElement(children, {
    elevation: trigger ? 8 : 0,
    className: canTransparentizeNavBar && !trigger ? '' : 'nav-background'
  });
}
