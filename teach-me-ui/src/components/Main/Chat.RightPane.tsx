import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Avatar from '@material-ui/core/Avatar';
import SchoolIcon from '@material-ui/icons/School';

import { ONE_TO_ONE } from '../../constants/chat';
import {
  APIConversationResponse,
  UserEnrolledData
} from '../../constants/interfaces';
import { InfoCard } from '../crumbs/Cards';

interface ChatRightPaneProps {
  conversation: APIConversationResponse;
  convoInfo: Partial<APIConversationResponse & UserEnrolledData>;
}

const ChatRightPane = ({ conversation, convoInfo }: ChatRightPaneProps) => {
  const {
    type,
    conversation_name: displayName,
    avatar,
    associated_username: username
  } = conversation;
  const {
    institution,
    department,
    level
  }: Partial<APIConversationResponse & UserEnrolledData> = convoInfo;

  return (
    <>
      <Col
        as='header'
        className='chat-header d-flex flex-column justify-content-center'>
        {type === ONE_TO_ONE ? 'User info' : 'Participants'}
      </Col>
      {type === ONE_TO_ONE ? (
        <Container
          as='section'
          className='user-info-container custom-scroll-bar small-bar grey-scrollbar p-3 debugger'>
          <Row as='section' className='m-0 flex-column mb-5'>
            <Col className='p-0 text-center'>
              <Avatar
                component='span'
                className='chat-avatar d-inline-block'
                alt={displayName}
                src={`/images/${avatar}`}
              />
            </Col>
            <Col className='p-0 text-center'>
              <Col
                className='display-name p-0 d-flex justify-content-center my-1'>
                {displayName}
              </Col>
              <Col
                className='username p-0 d-flex justify-content-center mb-4'>
                @{username}
              </Col>
            </Col>
          </Row>
          <InfoCard
            title='Academic Info'
            icon={SchoolIcon}
            data={[
              {
                name: 'institution',
                value: institution as string
              },
              { name: 'department', value: department as string },
              { name: 'level', value: level as string }
            ]}
            bgcolor='#fff'
            boxShadow='none'
            padding='0.25rem'
          />
        </Container>
      ) : (
        ''
      )}
    </>
  );
};

export default ChatRightPane;
