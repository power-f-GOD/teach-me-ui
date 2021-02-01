import React from 'react';
import axios from 'axios';
import { LazyLoadImage as LazyImg } from 'react-lazy-load-image-component';

import Box from '@material-ui/core/Box';

const Media = ({
  media,
  showModal
}: {
  media?: any[];
  showModal?(e: React.MouseEvent<HTMLImageElement, MouseEvent>): void;
}) => {
  return (media?.length || 0) > 0 ? (
    <Box
      className='media-container'
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: `repeat(${
          media?.length === 1 ? 2 : Math.ceil((media as any[]).length / 2)
        }, 12em)`,
        gridAutoFlow: 'row',
        columnGap: '0.3em',
        rowGap: '0.3em'
      }}>
      {media?.map((m, i, self) => {
        const style: any = {};
        switch (i) {
          case 0:
            if (self.length === 1) {
              style.gridColumn = '1 / 3';
              style.gridRow = '1 / 3';
            }

            if (self.length === 3 || self.length === 5) {
              style.gridColumn = '1';
              style.gridRow = '1 / 3';
            }

            break;
        }
        const mData = JSON.parse(m);
        const url = mData.type === 'raw' ? '/images/file-icon.svg' : mData.url;

        return (
          <div key={i} style={style}>
            <LazyImg
              id={i.toString()}
              onClick={
                mData.type === 'raw' || true
                  ? () => {
                      if (2 > 3)
                        axios({
                          url: mData.url,
                          method: 'GET',
                          responseType: 'blob'
                        }).then((res) => {
                          const dataURL = URL.createObjectURL(
                            new Blob([res.data])
                          );
                          const a = document.createElement('a');
                          a.href = dataURL;
                          a.download = 'file';
                          a.click();
                        });
                    }
                  : showModal
              }
              src={url}
              alt='post image'
              style={{ opacity: 0 }}
              onLoad={(e) => ((e.target as any).style.opacity = 1)}
            />
          </div>
        );
      })}
    </Box>
  ) : null;
};

export default Media;
