import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { Link } from 'react-router-dom';

import SchoolIcon from '@material-ui/icons/School';

import Box from '@material-ui/core/Box';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { UserData } from '../../constants';

import { userDeviceIsMobile } from '../../index';
import { dispatch } from '../../functions';
import { getRecommendations } from '../../actions';

const Recommendations = (props: any) => {
  const { recommendations, getRecommendationsStatus } = props;
  const _recommendations = [...recommendations].concat(
    recommendations.length < 3 ? [null, null] : []
  );

  useEffect(() => {
    dispatch(getRecommendations());
  }, []);

  return (
    <>
      {getRecommendationsStatus.status !== 'pending' &&
        _recommendations.length > 0 && (
          <Box
            className='recommendations'
            style={{
              gridTemplateColumns: `repeat(${_recommendations.length}, 13rem)`,
              columnGap: userDeviceIsMobile ? '.25rem' : '.5rem'
            }}>
            {_recommendations.map((recommendation: any) =>
              recommendation ? (
                <Recommendation
                  {...recommendation}
                  key={recommendation.id}
                  displayName={`${recommendation.firstname} ${recommendation.lastname}`}
                />
              ) : (
                <Box className='recommendation null'></Box>
              )
            )}
          </Box>
        )}
    </>
  );
};

const Recommendation = (props: any) => {
  const {
    avatar,
    displayName,
    username,
    institution,
    department,
    profile_photo
  }: UserData = props;

  return (
    <Link to={`/@${username}`} className='recommendation'>
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
            <Col as='span' className='username'>
              @{username}
            </Col>
          </Col>
        </Col>
      </Row>
      <Row as='section' className='academic m-0 flex-column'>
        <Col as='span' className='info institution'>
          <SchoolIcon className='mr-1' fontSize='small' />
          {institution}
        </Col>
        <Col as='span' className='info department'>
          {department}
        </Col>
      </Row>
    </Link>
  );
};

export default connect((state: any) => ({
  getRecommendationsStatus: state.getRecommendationsStatus,
  recommendations: state.recommendations
}))(Recommendations);
