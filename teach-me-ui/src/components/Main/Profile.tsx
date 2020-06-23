import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
// import CreateIcon from '@material-ui/icons/Create';
// import LocationOnIcon from '@material-ui/icons/LocationOn';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import SchoolOutlinedIcon from '@material-ui/icons/SchoolOutlined';
// import MenuBookIcon from '@material-ui/icons/MenuBook';
// import GroupIcon from '@material-ui/icons/Group';
// import ForumIcon from '@material-ui/icons/Forum';
// import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';

interface _Info {
  name: string;
  value: string;
}

let userInfo: any = {};
let [
  avatar,
  displayName,
  username,
  email,
  dob,
  institution,
  department,
  level
] = ['avatar-1.png', '', '', '', '', '', '', ''];

if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
  username = userInfo.username;
  email = userInfo.email;
  dob = userInfo.date_of_birth;
  institution = userInfo.institution;
  department = userInfo.department;
  level = userInfo.level;
}

const [firstname, lastname] = displayName.split(' ');

const basicInfo: _Info[] = [
  { name: 'Firstname', value: firstname },
  { name: 'Lastname', value: lastname },
  { name: 'Username', value: username },
  { name: 'Date of birth', value: dob.split('-').reverse().join('-') },
  { name: 'Email', value: email }
];

const academicInfo: _Info[] = [
  { name: 'Institution', value: institution },
  { name: 'Department', value: department },
  { name: 'Level', value: level }
];

const Profile = () => {
  return (
    <Box className='Profile fade-in' paddingY='5rem'>
      <Container className='rows-wrapper custom-scroll-bar small-bar rounded-bar tertiary-bar p-0'>
        <Row as='section' className='m-0 px-3 flex-column mb-5'>
          <Col className='p-0 d-flex justify-content-center'>
            <Avatar
              component='span'
              className='profile-avatar'
              alt={displayName}
              src={`/images/${avatar}`}
            />
          </Col>
          <Col className='d-flex flex-column p-0'>
            <Col as='span' className='display-name p-0 d-block my-1'>
              {displayName}
            </Col>
            <Col
              as='span'
              className='username p-0 d-flex justify-content-center mb-3'>
              @{username}
            </Col>
            <Col as='span' className='status p-0 px-3 d-block'>
              {/* <CreateIcon className='mr-2' /> */}
              Currently creating some amazing sturvs...
            </Col>
          </Col>
        </Row>

        <Row as='section' className='info-rows-container m-0'>
          <Col md={6} className='info-card-container py-0'>
            <Row as='section' className='basic-info-card mx-0 flex-column'>
              <Col className='info p-0 d-flex my-1'>
                <Col className='p-0 d-flex justify-content-between align-items-center'>
                  <Box component='h2' className='card-title mr-auto'>
                    Basic info
                  </Box>
                  <AccountCircleOutlinedIcon className='' fontSize='large' />
                </Col>
              </Col>

              <hr />

              <Row className='mx-0'>
                {basicInfo.map(({ name, value }: _Info) => (
                  <Info name={name} value={value} key={name} />
                ))}
              </Row>
            </Row>
          </Col>

          <Col md={6} className='info-card-container py-0'>
            <Row as='section' className='academic-info-card mx-0 flex-column'>
              <Col className='info p-0 d-flex my-1'>
                <Col className='p-0 d-flex justify-content-between align-items-center'>
                  <Box component='h2' className='card-title mr-auto'>
                    Academic info
                  </Box>
                  <SchoolOutlinedIcon className='' fontSize='large' />
                </Col>
              </Col>

              <hr />
              <Row className='mx-0'>
                {academicInfo.map(({ name, value }: _Info) => (
                  <Info name={name} value={value} key={name} />
                ))}
              </Row>
            </Row>
          </Col>
        </Row>
      </Container>
    </Box>
  );
};

function Info({ name, value }: any) {
  return (
    <Col
      xs={/email|institution/i.test(name) ? 12 : 6}
      className='info p-0 d-flex mb-3 mt-2'>
      <Col as='span' className='p-0 d-flex flex-column align-items-start pr-3'>
        <Box component='span' className='info-name'>
          {name}:
        </Box>
        <Box component='span' className='info-value'>
          {value}
        </Box>
      </Col>
    </Col>
  );
}

export default Profile;
