import React from 'react';
import {Link} from 'react-router-dom';

import Col from 'react-bootstrap/Col';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const [CV, CR] = ['Conversations', 'Classrooms'];

const ChatLeftPane = (props: any) => {
  const [value, setValue] = React.useState<number>(0);
  const {pathname} = window.location;
  const users =[{
    name: 'Emmanuel Sunday',
    avatar: 'emmanuel.png'
  }, {
    name: 'Abba Chinomso',
    avatar: 'avatar-2.png'
  }];
  const rooms = ['Room 1', 'Room 2', 'Room 3'];

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

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
        {users.map((user: any) => <Link to={`${pathname}?chat&converstation=${user}`} className='tab-panel-item p-0' key={user}>
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
                className='chat-avatar mr-2'
                alt={user.name}
                src={`/images/${user.avatar}`}
              />
            </Badge>{' '}
            {user.name}
          </Col>
        </Link>)}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {rooms.map((room: string) => <Link to={`${pathname}?chat&classroom=${room}`} className='tab-panel-item' key={room}>{room}</Link>)}
      </TabPanel>
    </Box>
  );
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const name = (value === 0 ? CV : CR).toLowerCase();

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={name}
      className={`${name}-tab-panel ${value === index ? 'show' : 'hide'}`}
      aria-labelledby={index}
      {...other}>
        <Box>
          <Typography>{children}</Typography>
        </Box>
    </div>
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
