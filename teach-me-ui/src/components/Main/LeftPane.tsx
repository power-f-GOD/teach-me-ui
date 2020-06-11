import React from 'react';

import Avatar from '@material-ui/core/Avatar';
import CreateIcon from '@material-ui/icons/Create';
// import LocationOnIcon from '@material-ui/icons/LocationOn';
import SchoolIcon from '@material-ui/icons/School';
import ClassIcon from '@material-ui/icons/Class';
import GroupIcon from '@material-ui/icons/Group';
import ForumIcon from '@material-ui/icons/Forum';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';

let userInfo: any = {};
let [avatar, displayName, username, institution, department] = ['', '', '', '', ''];

if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
  username = userInfo.username;
  institution = userInfo.institution;
  department = userInfo.department;
}

const LeftPane = () => {
  return (
    <Container as='section' className='left-pane p-2'>
      <Container className='rows-wrapper custom-scroll-bar small-bar rounded-bar tertiary-bar debugger'>
        <Row as='section' className='m-0 flex-column mb-4'>
          <Col className='p-0 d-flex justify-content-center'>
            <Avatar
              component='span'
              className='chat-avatar'
              alt={displayName}
              src={`/images/${avatar}`}
            />
          </Col>
          <Col className='d-flex flex-column p-0'>
            <Col as='span' className='display-name p-0 d-flex justify-content-center my-1'>{displayName}</Col>
            <Col as='span' className='username p-0 d-flex justify-content-center mb-4'>@{username}</Col>
            <Col as='span' className='status p-0 px-3 d-flex  align-content-around'>
              <CreateIcon className='mr-2' />Currently creating some amazing sturvs...
            </Col>
          </Col>
        </Row>
        <Row as='section' className='m-0 flex-column mb-4'>
          <Col className='info p-0 d-flex my-1'>
            <PeopleOutlineIcon className='mr-2' fontSize='large' />
            <Col as='span' className='p-0 d-flex justify-content-between align-items-center'>
              <Box component='span' marginRight='auto'>Colleagues</Box>
              <Box component='span' className='number'>0</Box>
            </Col>
          </Col>
          <Col className='info p-0 d-flex my-1'>
            <GroupIcon className='mr-2' fontSize='large' />
            <Col as='span' className='p-0 d-flex justify-content-between align-items-center'>
              <Box component='span' marginRight='auto'>Groups</Box>
              <Box component='span' className='number'>0</Box>
            </Col>
          </Col>
          <Col className='info p-0 d-flex my-1'>
            <ForumIcon className='mr-2' fontSize='large' />
            <Col as='span' className='p-0 d-flex justify-content-between align-items-center'>
              <Box component='span' marginRight='auto'>Classrooms</Box>
              <Box component='span' className='number'>0</Box>
            </Col>
          </Col>
        </Row>
        <Row as='section' className='academic m-0 flex-column'>
          <Col as='span' className='info p-0 d-flex my-1  align-items-center'>
            <SchoolIcon className='mr-2' fontSize='large' />{institution}
          </Col>
          <Col as='span' className='info p-0 d-flex my-1  align-items-center'>
            <ClassIcon className='mr-2' fontSize='large' />{department}
          </Col>
        </Row>
      </Container>
      
    </Container>
  );
};

export default LeftPane;
