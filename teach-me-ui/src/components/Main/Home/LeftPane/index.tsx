import React from 'react';
import { connect } from 'react-redux';

import CreateIcon from '@material-ui/icons/Create';
// import LocationOnIcon from '@material-ui/icons/LocationOn';
import SchoolIcon from '@material-ui/icons/School';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import GroupIcon from '@material-ui/icons/Group';
import ForumIcon from '@material-ui/icons/Forum';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';

import { UserData } from '../../../../types';
import { KAvatar } from '../../../shared';

interface LeftPaneProps {
  userData: UserData;
}

const HomeLeftPane = (props: LeftPaneProps) => {
  const { userData } = props;
  const {
    displayName,
    username,
    institution,
    department,
    profile_photo,
    cover_photo,
    colleague_count
  }: UserData = userData;

  return (
    <Container
      as='section'
      className={`left-pane ${cover_photo ? 'has-cover-photo' : ''}`}>
      <Container className='rows-wrapper custom-scroll-bar rounded-bar tertiary-bar'>
        <Row as='section' className='d-block'>
          <Col
            className='cover-photo'
            style={{ backgroundImage: `url(${cover_photo})` }}
          />
          <KAvatar
            className={`avatar ${profile_photo ? 'has-photo' : ''}`}
            alt={displayName}
            src={profile_photo ? profile_photo : ''}
          />
          <Col className='bio-wrapper d-inline-block'>
            <Col
              as='span'
              className={`display-name font-bold ${
                cover_photo ? 'light' : ''
              }`}>
              {displayName}
            </Col>
            <Col as='span' className='username'>
              @{username}
            </Col>
            <Col as='span' className='status'>
              <CreateIcon className='mr-1' fontSize='inherit' />
              {userData.bio || 'Hey there, I am on Kanyimuta'}
            </Col>
          </Col>
        </Row>

        <Row as='section' className='d-block'>
          <Col className='info d-flex my-1'>
            <PeopleOutlineIcon className='mr-2' />
            <Col
              as='span'
              className='d-flex justify-content-between align-items-center'>
              <Box component='span' marginRight='auto'>
                Colleagues
              </Box>
              <Box
                component='span'
                className={`number ${colleague_count ? 'font-bold' : ''}`}>
                {colleague_count}
              </Box>
            </Col>
          </Col>

          <Col className='info d-flex my-1'>
            <GroupIcon className='mr-2' />
            <Col
              as='span'
              className='d-flex justify-content-between align-items-center'>
              <Box component='span' marginRight='auto'>
                Groups
              </Box>
              <Box component='span' className='number'>
                N/A
              </Box>
            </Col>
          </Col>
          <Col className='info d-flex my-1'>
            <ForumIcon className='mr-2' />
            <Col
              as='span'
              className='d-flex justify-content-between align-items-center'>
              <Box component='span' marginRight='auto'>
                Classrooms
              </Box>
              <Box component='span' className='number'>
                N/A
              </Box>
            </Col>
          </Col>
        </Row>

        <Row as='section' className='academic d-block'>
          <Col as='span' className='info d-flex my-1  align-items-center'>
            <SchoolIcon className='mr-2' />
            {institution}
          </Col>
          <Col as='span' className='info d-flex my-1  align-items-center'>
            <MenuBookIcon className='mr-2' />
            {department}
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default connect((state: any) => ({
  userData: state.userData
}))(HomeLeftPane);
