import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';

import queryString from 'query-string';

import Col from 'react-bootstrap/Col';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';

import {
  setActiveChat
  //  requestNewConversation
} from '../../actions/chat';
import { dispatch } from '../../functions/utils';
import { Chat, UserEnrolledData } from '../../constants/interfaces';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const [CV, CR] = ['Conversations', 'Classrooms'];

const ChatLeftPane = (props: any) => {
  const [value, setValue] = React.useState<number>(0);
  const { rooms, conversations: usersEnrolled } = props;
  const { pathname } = window.location;
  const conversations: Chat[] =
    usersEnrolled?.map(
      (user: UserEnrolledData): Chat => {
        const {
          firstname,
          lastname,
          id,
          username,
          institution,
          department,
          level
        }: UserEnrolledData = user;
        const conversation: Chat = {
          anchor: {
            displayName: `${firstname} ${lastname}`,
            avatar: '',
            id,
            type: 'conversation',
            info: {
              username,
              institution: institution || 'N/A',
              department: department || 'N/A',
              level: level || 'N/A'
            }
          }
        };

        return conversation;
      }
    ) ?? [];

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const handleChatClick = useCallback((chatInfo: Chat) => {
    return () => {
      dispatch(setActiveChat(chatInfo));
      // dispatch(requestNewConversation(chatInfo.id)(dispatch));
    };
  }, []);

  return (
    <Box width='100%'>
      <AppBar position='static'>
        <Tabs
          className='tab-links-container'
          value={value}
          onChange={handleChange}
          aria-label='Chat left pane tab panels'>
          <Tab label={CV} {...a11yProps(0)} />
          <Tab label={CR} {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        {!!conversations[0]
          ? conversations.map((conversation: Chat) => {
              const { anchor } = conversation;
              const { displayName, avatar, id } = anchor;
              const _queryString = `${pathname}?chat=open&type=conversation&id=${id}&name=${displayName}`;
              const chatInfo: Chat = {
                ...conversation,
                queryString: _queryString
              };

              return (
                <NavLink
                  to={_queryString}
                  className='tab-panel-item p-0'
                  key={id}
                  isActive={(_match, location) =>
                    queryString.parse(location.search)?.id === id
                  }
                  onClick={handleChatClick({ ...chatInfo })}>
                  <Col as='span' className='colleague-name'>
                    <Badge
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                      }}
                      // color='primary'
                      className='offline'
                      overlap='circle'
                      variant='dot'>
                      <Avatar
                        component='span'
                        className='chat-avatar mr-2'
                        alt={displayName}
                        src={`/images/${avatar ?? ''}`}
                      />
                    </Badge>{' '}
                    {displayName}
                  </Col>
                </NavLink>
              );
            })
          : ''}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {rooms.map((room: Chat) => {
          const _pathname = `${pathname}?chat=open&type=classroom&id=${room.anchor.id}&name=${room.anchor.displayName}`;
          const chatInfo: Chat = {
            ...room,
            queryString: _pathname
          };

          return (
            <NavLink
              to={_pathname}
              className='tab-panel-item'
              key={room.anchor.displayName}
              isActive={(_match, location) =>
                queryString.parse(location.search)?.id === room.anchor.id
              }
              onClick={handleChatClick({ ...chatInfo })}>
              {room.anchor.displayName}
            </NavLink>
          );
        })}
      </TabPanel>
    </Box>
  );
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const name = (value === 0 ? CV : CR).toLowerCase();

  return (
    <section
      role='tabpanel'
      hidden={value !== index}
      id={name}
      className={`tab-panel ${
        value === index ? 'show' : 'hide'
      } custom-scroll-bar`}
      aria-labelledby={index}
      {...other}>
      <Box>
        <Typography>{children}</Typography>
      </Box>
    </section>
  );
}

function a11yProps(index: any) {
  return {
    id: index,
    'aria-controls': index,
    className: 'tab-link'
  };
}

export default ChatLeftPane;
