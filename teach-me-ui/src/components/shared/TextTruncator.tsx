import React, { useEffect, useRef, useState, useCallback } from 'react';

import Button from '@material-ui/core/Button';

/**
 *
 * @param props For this to work properly, ensure component is placed as a direct child of the `anchor` prop
 */
const TextTruncator = (props: {
  anchor?: HTMLElement;
  anchorEllipsis?: boolean;
  lineClamp?: number;
  buttonText?: string;
  className?: string;
  displayButton?: boolean;
  backgroundColor?: string;
  color?: string;
}) => {
  const {
    anchor: _anchor,
    buttonText,
    className,
    anchorEllipsis,
    lineClamp: _lineClamp,
    displayButton,
    color,
    backgroundColor
  } = props;
  let heightThreshold = useRef<number>(0);
  let lineClamp = _lineClamp ?? 5;

  const truncatorRef = useRef<HTMLElement | null>();

  const [shouldTruncate, setShouldTruncate] = useState(true);
  const [anchor, setAnchor] = useState<HTMLElement | undefined>(_anchor); // attempt to set anchor (to parentNode) if _anchor is undefined on first render

  const deTruncate = useCallback(() => {
    setShouldTruncate(false);
  }, []);

  useEffect(() => {
    if (anchor) {
      let {
        fontSize,
        lineHeight,
        position,
        paddingTop
      } = window.getComputedStyle(anchor);

      if (position !== 'relative') {
        anchor.style.position = 'relative';
      }

      fontSize = `${parseFloat(fontSize)}`;
      lineHeight = `${parseFloat(lineHeight)}`;
      heightThreshold.current =
        (+fontSize + (+lineHeight - +fontSize)) * lineClamp;
      anchor.classList[shouldTruncate ? 'add' : 'remove']('truncate');
      anchor.className += `${anchorEllipsis ? ' ellipsis' : ''}`;
      (anchor.style as any).webkitLineClamp = lineClamp;
      (anchor.style as any).mozLineClamp = lineClamp;
      anchor.style.maxHeight = shouldTruncate
        ? `${heightThreshold.current + (parseFloat(paddingTop) || 1)}px`
        : 'unset';
    }
  }, [anchor, shouldTruncate, anchorEllipsis, lineClamp]);

  useEffect(() => {
    if (anchor) {
      setShouldTruncate(anchor?.offsetHeight > heightThreshold.current);
    } else {
      const truncator = truncatorRef.current;

      if (truncator) {
        setAnchor(truncator.parentNode as HTMLElement);
      }
    }
  }, [anchor, heightThreshold]);

  return (
    <Button
      onClick={deTruncate}
      className={`text-truncator ${className ?? ''} ${
        (shouldTruncate && displayButton === undefined ? true : displayButton)
          ? 'd-inline-flex'
          : 'd-none'
      }`}
      style={{ color, backgroundColor }}
      ref={truncatorRef as any}>
      {buttonText ?? '...Keep reading'}
    </Button>
  );
};

export default TextTruncator;
