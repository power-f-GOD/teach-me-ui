import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import Col from 'react-bootstrap/Col';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';

import { setActiveChat } from '../../actions/chat';
import { dispatch } from '../../functions/utils';
import { Chat } from '../../constants/interfaces';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const [CV, CR] = ['Conversations', 'Classrooms'];

const ChatLeftPane = (props: any) => {
  const [value, setValue] = React.useState<number>(0);
  const { conversations, rooms } = props;
  const { pathname } = window.location;

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const handleChatClick = useCallback((chatInfo: Chat) => {
    return () => {
      dispatch(setActiveChat(chatInfo));
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
        {conversations.map((conversation: Chat) => {
          const _pathname = `${pathname}?chat=open&type=conversation&name=${conversation.name}`;
          const chatInfo = {
            ...conversation,
            pathname: _pathname
          };

          return (
            <Link
              to={_pathname}
              className='tab-panel-item p-0'
              key={conversation.name}
              onClick={handleChatClick({ ...chatInfo })}>
              <Col as='span' className='colleague-name'>
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
                    alt={conversation.name}
                    src={`/images/${conversation.avatar}`}
                  />
                </Badge>{' '}
                {conversation.name}
              </Col>
            </Link>
          );
        })}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {rooms.map((room: Chat) => {
          const _pathname = `${pathname}?chat=open&type=classroom&name=${room.name}`;
          const chatInfo = {
            ...room,
            pathname: _pathname
          };

          return (
            <Link
              to={_pathname}
              className='tab-panel-item'
              key={room.name}
              onClick={handleChatClick({ ...chatInfo })}>
              {room.name}
            </Link>
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
      className={`${name}-tab-panel ${value === index ? 'show' : 'hide'}`}
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
