import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import CreateIcon from '@material-ui/icons/Create';
// import LocationOnIcon from '@material-ui/icons/LocationOn';
import SchoolIcon from '@material-ui/icons/School';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import ClassIcon from '@material-ui/icons/Class';

import { CONVO_CHAT_TYPE } from '../../constants/chat';
import { AnchorInfo, UserInfo } from '../../constants/interfaces';

const ChatRightPane = (props: any) => {
  const anchor = props.activeChat.anchor;
  const {
    displayName,
    avatar,
    type: activeChatType,
    info
  }: AnchorInfo = anchor;
  const userInfo = { ...info } as UserInfo;
  // const roomInfo = {...info} as RoomInfo;

  return (
    <>
      <Col
        as='header'
        className='chat-header d-flex flex-column justify-content-center'>
        {activeChatType === CONVO_CHAT_TYPE ? 'User info' : 'Participants'}
      </Col>
      {activeChatType === CONVO_CHAT_TYPE ? (
        <Container
          as='section'
          className='chat-right-pane custom-scroll-bar small-bar rounded-bar tertiary-bar p-3 debugger'>
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
              <Col
                as='span'
                className='display-name p-0 d-flex justify-content-center my-1'>
                {displayName}
              </Col>
              <Col
                as='span'
                className='username p-0 d-flex justify-content-center mb-4'>
                @{userInfo.username}
              </Col>
              <Col
                as='span'
                className='status p-0 px-3 d-flex  align-content-around'>
                <CreateIcon className='mr-2' />
                Currently creating some amazing sturvs...
              </Col>
            </Col>
          </Row>
          <Row as='section' className='academic m-0 flex-column'>
            <Col as='span' className='info p-0 d-flex my-2  align-items-center'>
              <SchoolIcon className='mr-2' />
              {userInfo.institution}
            </Col>
            <Col as='span' className='info p-0 d-flex my-2  align-items-center'>
              <MenuBookIcon className='mr-2' />
              {userInfo.department}
            </Col>
            <Col as='span' className='info p-0 d-flex my-2  align-items-center'>
              <ClassIcon className='mr-2' />
              {userInfo.level}
            </Col>
          </Row>
        </Container>
      ) : (
        ''
      )}

      {/* <Col as='section' className='participants-container p-0'>
        {activeChatType === ROOM_CHAT_TYPE &&
          participants.map((participant: any, key: number) => {
            return (
              <Col as='span' className='colleague-name' key={key}>
                <Badge
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  color='primary'
                  overlap='circle'
                  variant='dot'>
                  <Avatar
                    component='span'
                    className='chat-avatar mr-2'
                    alt={participant.name}
                    src={`/images/${participant.avatar}`}
                  />
                </Badge>{' '}
                {participant.name}
              </Col>
            );
          })}
      </Col> */}
    </>
  );
};

export default ChatRightPane;
