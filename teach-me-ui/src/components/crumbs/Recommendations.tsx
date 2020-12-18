import React from 'react';

import { Link } from 'react-router-dom';

import SchoolIcon from '@material-ui/icons/School';

import Box from '@material-ui/core/Box';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { UserData, FetchState } from '../../constants';

import { userDeviceIsMobile } from '../../index';

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
            className='font-bold theme-tertiary-darker recommendations-heading'>
            Colleauges you may know
          </Box>
          <Box
            className='recommendations'
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

const Recommendation = (props: UserData) => {
  const {
    avatar,
    displayName,
    username,
    institution,
    department,
    profile_photo
  } = props;

  return (
    <Link
      to={`/@${username}`}
      className={`recommendation ${!profile_photo ? 'no-photo' : ''}`}>
      <Row as='section' className='m-0 d-block h-100'>
        <Col
          className='profile-photo'
          role='img'
          style={{
            backgroundImage: `url(${
              profile_photo
                ? profile_photo.replace(/\/c_crop.*w_200/, '/c_scale,w_250')
                : `/images/${avatar}`
            })`
          }}
          aria-label={`${displayName}'s profile photo`}>
          <Col className='display-name-wrapper'>
            <Col as='span' className='display-name font-bold'>
              {displayName}
            </Col>
            <Col as='span' className='username text-ellipsis'>
              @{username}
            </Col>
          </Col>
        </Col>
      </Row>
      <Row as='section' className='academic m-0 flex-column'>
        <Col as='span' className='info institution text-ellipsis'>
          <SchoolIcon className='mr-1' fontSize='small' />
          {institution}
        </Col>
        <Col as='span' className='info department text-ellipsis'>
          {department}
        </Col>
      </Row>
    </Link>
  );
};

export default Recommendations;
