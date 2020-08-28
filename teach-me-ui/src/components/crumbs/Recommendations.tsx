import React from 'react';
import { connect } from 'react-redux';

import { useHistory } from 'react-router-dom';

import Avatar from '@material-ui/core/Avatar';
import SchoolIcon from '@material-ui/icons/School';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import AddIcon from '@material-ui/icons/Person';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { UserData } from '../../constants';
import { useGetRecommendations } from '../../hooks/api';

import { userDeviceIsMobile } from '../../index';

const Recommendations = (props: any) => {
  const [
    ,
    recommendations,
    getRecommendationsIsLoading
  ] = useGetRecommendations();
  return (
    <>
      {!getRecommendationsIsLoading &&
        recommendations !== null &&
        !recommendations.error && (
          <Box
            className='recommendations pb-1 pb-md-2'
            style={{
              gridTemplateColumns: `repeat(${recommendations.recommendations.length}, 13rem)`,
              columnGap: userDeviceIsMobile ? '.25rem' : '.5rem'
            }}>
            {recommendations.recommendations.map((recommendation: any) => (
              <Recommendation
                {...recommendation}
                key={recommendation.id}
                displayName={`${recommendation.firstname} ${recommendation.lastname}`}
              />
            ))}
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
    department
  }: UserData = props;
  const history = useHistory();
  const navigate = (e: any) => {
    history.push(`/@${username}`);
  };
  return (
    <Box>
      <Container
        as='section'
        className='left-pane p-2'
        style={{ height: '100%', cursor: 'pointer' }}>
        <Container className='rows-wrapper custom-scroll-bar small-bar rounded-bar tertiary-bar debugger'>
          <Row as='section' className='m-0 flex-column mb-2 d-block'>
            <Col className='p-0 d-flex safari-fix-d-block text-center justify-content-center'>
              <Avatar
                component='div'
                className='recommendation-avatar text-center'
                alt={displayName}
                src={`/images/${avatar}`}
              />
            </Col>
            <Col className='flex-column p-0 safari-fix-d-block'>
              <Col
                as='span'
                className='display-name p-0 d-flex justify-content-center my-1'>
                {displayName}
              </Col>
              <Col
                as='span'
                className='username p-0 d-flex justify-content-center mb-2'>
                @{username}
              </Col>
            </Col>
          </Row>
          <Row as='section' className='academic m-0 flex-column d-block'>
            <Col
              as='span'
              className='info p-0 d-flex my-1 justify-content-center align-items-center'>
              <SchoolIcon className='mr-2' fontSize='small' />
              {institution}
            </Col>
            <Col
              as='span'
              className='info p-0 d-flex my-1 justify-content-center align-items-center'>
              <MenuBookIcon className='mr-2' fontSize='small' />
              {department}
            </Col>
            <Col
              as='span'
              className='info p-0 d-flex mt-2 justify-content-center align-items-center'>
              <Button
                variant='contained'
                onClick={navigate}
                size='small'
                className='add-button'>
                <>
                  <AddIcon fontSize='small' />
                  <Box fontSize='.7rem' ml={1}>
                    View Profile
                  </Box>
                </>
              </Button>
            </Col>
          </Row>
        </Container>
      </Container>
    </Box>
  );
};

export default connect((state: any) => ({ userData: state.userData }))(
  Recommendations
);