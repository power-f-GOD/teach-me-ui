import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import { ONE_TO_ONE } from '../../../../constants/chat';
import { APIConversationResponse } from '../../../../types';
import { InfoCard } from '../../../shared/Card';
import { FAIcon } from '../../../shared/Icons';
import { useHistory } from 'react-router-dom';

interface ChatRightPaneProps {
  convoType: string;
  convoDisplayName: string;
  convoProfilePhoto: string;
  convoUsername: string;
  convoInfo?: APIConversationResponse['colleague'];
  convosErr: boolean;
  onlineStatusString: string;
  handleSetActivePaneIndex(index: number): any;
}

const ChatRightPane = (props: ChatRightPaneProps) => {
  const {
    convoType,
    convoDisplayName,
    convoUsername,
    convosErr,
    convoInfo,
    convoProfilePhoto,
    onlineStatusString
  } = props;
  const { institution, department, level } = convoInfo ?? {};
  const badgeStatus = /last seen/i.test(onlineStatusString)
    ? 'offline'
    : /away/i.test(onlineStatusString)
    ? 'away'
    : 'online';

  const history = useHistory();

  const handleBackButtonClick = React.useCallback(() => {
    history.goBack();
  }, [history]);

  return (
    <>
      <Col
        as='header'
        className='chat-header d-flex justify-content-start align-items-center px-2'>
        <Box component='span' className='chat-header-control-wrapper ml-1'>
          <IconButton
            className='back-button'
            onClick={handleBackButtonClick}
            aria-label='go back'>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Box component='span' className='font-bold px-1'>
          {convoType === ONE_TO_ONE ? 'User info' : 'Participants'}
        </Box>
      </Col>
      {convoType === ONE_TO_ONE ? (
        <Container
          as='section'
          className='chat-user-info-container custom-scroll-bar grey-scrollbar p-3 debugger'>
          <Row as='section' className='m-0 flex-column mb-5'>
            <Col className='p-0 text-center'>
              <Avatar
                component='span'
                className='chat-avatar d-inline-block'
                alt={convoDisplayName}
                src={convoProfilePhoto || ''}
              />
            </Col>
            <Col className='p-0 text-center'>
              <Col className='display-name p-0 d-flex justify-content-center my-1'>
                {convoDisplayName}
              </Col>
              <Col className='username p-0 d-flex justify-content-center mb-4'>
                @{convoUsername}
              </Col>
              <Col
                className={`online-status ${
                  convosErr || /^\.\.\.$/.test(onlineStatusString)
                    ? 'hide'
                    : 'show'
                } ${!convosErr ? badgeStatus : 'offline'} ${
                  /typing/.test(onlineStatusString) ? 'font-bold' : ''
                } px-1 mb-4`}>
                {onlineStatusString}
              </Col>
            </Col>
          </Row>

          <Box className={`info-card-wrapper text-center`}>
            <InfoCard
              title='Education'
              icon={<FAIcon name='university' />}
              data={[
                {
                  name: 'institution',
                  value: institution as string
                },
                { name: 'department', value: department as string },
                { name: 'level', value: level as string }
              ]}
              bgColor='#fff'
              boxShadow='none'
              padding='0.25rem 0'
            />
          </Box>
        </Container>
      ) : (
        ''
      )}
      <Box className='scroll-bar-fader' />
    </>
  );
};

export default ChatRightPane;
