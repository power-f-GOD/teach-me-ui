import React from 'react';

import Box from '@material-ui/core/Box';

import { UserData, FetchState } from '../../../../../types';

import { userDeviceIsMobile } from '../../../../../index';
import Recommendation from './Recommendation';

const Recommendations = ({
  recommendations: { status, data }
}: {
  recommendations: FetchState<UserData[]>;
}) => {
  let _recommendations = [...data];

  _recommendations = [..._recommendations].concat(
    _recommendations.length && _recommendations.length < 3
      ? [null as any, null]
      : []
  );

  return (
    <>
      {status !== 'pending' && _recommendations.length > 0 && (
        <>
          <Box
            component='h3'
            className='font-bold theme-tertiary-darker recommendations-heading fade-in-opacity'>
            Colleague Suggestions
          </Box>
          <Box
            className='recommendations fade-in-opacity'
            style={{
              gridTemplateColumns: `repeat(${_recommendations.length}, 12rem)`,
              columnGap: userDeviceIsMobile ? '.5rem' : '.75rem'
            }}>
            {_recommendations.map((recommendation, i) =>
              recommendation ? (
                <Recommendation
                  {...recommendation}
                  key={recommendation.id}
                  displayName={`${recommendation.first_name} ${recommendation.last_name}`}
                />
              ) : (
                <Box className='recommendation null' key={i}></Box>
              )
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default Recommendations;
