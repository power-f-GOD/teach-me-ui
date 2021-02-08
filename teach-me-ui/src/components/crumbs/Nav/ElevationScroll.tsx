import React from 'react';

import useScrollTrigger from '@material-ui/core/useScrollTrigger';

export default function ElevationScroll(props: {
  children: React.ReactElement;
  transparentizeNavBar: boolean;
  windowWidth: number;
  location: Location;
}) {
  const { children, transparentizeNavBar, windowWidth, location } = props;
  const atHome = /^\/(home|index)?$/.test(location.pathname);

  let trigger = useScrollTrigger({
    disableHysteresis: !atHome,
    threshold: 60
  });

  if (atHome && windowWidth < 768) {
    document.body.dataset.hideNav = '' + trigger;
  }

  return React.cloneElement(children, {
    elevation: trigger ? 8 : 0,
    className:
      trigger || !transparentizeNavBar || atHome ? 'nav-background' : ''
  });
}
