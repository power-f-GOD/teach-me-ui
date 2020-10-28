import React from 'react';
import { connect } from 'react-redux';

import Avatar from '@material-ui/core/Avatar';
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

import { UserData } from '../../constants/interfaces';

const LeftPane = (props: any) => {
  const { userData } = props;
  const {
    avatar,
    displayName,
    username,
    institution,
    department
  }: UserData = userData;

  return (
    <Container as='section' className='left-pane p-2'>
      <Container className='rows-wrapper custom-scroll-bar small-bar rounded-bar tertiary-bar debugger'>
        <Row as='section' className='m-0 flex-column mb-4 d-block'>
          <Col className='p-0 d-flex safari-fix-d-block text-center justify-content-center'>
            <Avatar
              component='span'
              className='chat-avatar'
              alt={displayName}
              src={userData.profile_photo ? userData.profile_photo : `images/${avatar}`}
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
              className='username p-0 d-flex justify-content-center mb-4'>
              @{username}
            </Col>
            <Col
              as='span'
              className='status p-0 px-3 d-flex safari-fix-d-block align-content-around'>
              <CreateIcon className='mr-2' />
              {userData.bio || 'Hey there, I am on Kanyimuta'}
            </Col>
          </Col>
        </Row>
        <Row as='section' className='m-0 flex-column mb-4 d-block'>
          <Col className='info p-0 d-flex my-1'>
            <PeopleOutlineIcon className='mr-2' fontSize='large' />
            <Col
              as='span'
              className='p-0 d-flex justify-content-between align-items-center'>
              <Box component='span' marginRight='auto'>
                Colleagues
              </Box>
              <Box component='span' className='number'>
                0
              </Box>
            </Col>
          </Col>
          {false && (
            <>
              <Col className='info p-0 d-flex my-1'>
                <GroupIcon className='mr-2' fontSize='large' />
                <Col
                  as='span'
                  className='p-0 d-flex justify-content-between align-items-center'>
                  <Box component='span' marginRight='auto'>
                    Groups
                  </Box>
                  <Box component='span' className='number'>
                    0
                  </Box>
                </Col>
              </Col>
              <Col className='info p-0 d-flex my-1'>
                <ForumIcon className='mr-2' fontSize='large' />
                <Col
                  as='span'
                  className='p-0 d-flex justify-content-between align-items-center'>
                  <Box component='span' marginRight='auto'>
                    Classrooms
                  </Box>
                  <Box component='span' className='number'>
                    0
                  </Box>
                </Col>
              </Col>
            </>
          )}
        </Row>
        <Row as='section' className='academic m-0 flex-column d-block'>
          <Col as='span' className='info p-0 d-flex my-1  align-items-center'>
            <SchoolIcon className='mr-2' fontSize='large' />
            {institution}
          </Col>
          <Col as='span' className='info p-0 d-flex my-1  align-items-center'>
            <MenuBookIcon className='mr-2' fontSize='large' />
            {department}
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default connect((state: any) => ({ userData: state.userData }))(
  LeftPane
);
