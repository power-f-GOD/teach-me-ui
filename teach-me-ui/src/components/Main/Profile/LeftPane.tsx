import React from 'react';

import Col from 'react-bootstrap/Col';
import { UserData, InfoCardProps } from '../../../types';
import { InfoCard } from '../../shared/Card';
import { FAIcon } from '../../shared/Icons';

const ProfileLeftPane = (props: { data: UserData; isSelfView: boolean }) => {
  const { data, isSelfView } = props;
  const {
    first_name,
    last_name,
    email,
    username,
    date_of_birth,
    institution,
    department,
    level
    // bio
  } = data;
  const dob = date_of_birth?.split('-').reverse().join('-') || '';
  
  const basicInfo: InfoCardProps['data'] = [
    { name: 'Firstname', value: first_name },
    { name: 'Lastname', value: last_name },
    { name: 'Username', value: username },
    { name: 'Date of birth', value: dob },
    { name: 'Email', value: email }
    // { name: 'Bio', value: bio! }
  ];
  const academicInfo: InfoCardProps['data'] = [
    { name: 'Institution', value: institution },
    { name: 'Department', value: department },
    { name: 'Level', value: level }
  ];

  return (
    <Col
      md={12}
      lg={3}
      className={`${
        isSelfView ? '' : 'hang-in no-hang-in hang-in-lg'
      } d-flex flex-lg-column flex-sm-row flex-column mt-3 pl-sm-3 px-0 my-sm-0`}>
      {isSelfView && (
        <InfoCard
          title='Account'
          icon={<FAIcon name='user' fontSize='1.5em' />}
          data={basicInfo}
          bgColor='#fff'
          boxShadow='none'
          padding='0.75rem'
          className='mr-sm-3'
        />
      )}
      <InfoCard
        title='Education'
        icon={<FAIcon name='university' fontSize='1.5em' />}
        data={academicInfo}
        bgColor='#fff'
        boxShadow='none'
        padding='0.75rem'
        className='mr-sm-3'
      />
    </Col>
  );
};

export default ProfileLeftPane;
