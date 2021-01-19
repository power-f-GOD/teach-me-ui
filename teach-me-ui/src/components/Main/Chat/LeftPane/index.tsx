import React, { useCallback } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import ForumIcon from '@material-ui/icons/Forum';
import ChatIcon from '@material-ui/icons/Chat';

import { addEventListenerOnce, delay } from '../../../../functions/utils';
import { SearchState } from '../../../../types';
import { Skeleton, DISPLAY_INFO } from '../../../shared/Loaders';
import { Memoize } from '..';
import { ConversationsList } from './Conversations';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
  [key: string]: any;
}

interface ChatLeftPaneProps {
  conversations: SearchState;
  rooms?: any[];
  userId: string;
  userFirstname: string;
}

const [CV, CR] = ['Conversations', 'Classrooms'];

const allyProps = (index: any) => {
  return {
    id: index,
    'aria-controls': index,
    className: 'chat-tab-link'
  };
};

const ChatLeftPane = (props: ChatLeftPaneProps) => {
  const { conversations: _conversations, userId, userFirstname } = props;
  const [value, setValue] = React.useState<number>(0);

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
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
          <Tab
            label='Conversations'
            icon={<ChatIcon />}
            {...allyProps(0)}
            style={{ minWidth: '50%' }}
          />
          <Tab
            label='Groups'
            icon={<ForumIcon />}
            {...allyProps(1)}
            style={{ minWidth: '50%' }}
          />
        </Tabs>
      </AppBar>
      <Box className='chat-tab-panels-wrapper d-flex' position='relative'>
        <Memoize
          memoizedComponent={TabPanel}
          value={value}
          index={0}
          status={_conversations.status}>
          {_conversations.status === 'pending' ? (
            Array(Math.floor(window.innerHeight / 60))
              .fill('')
              .map((_, key) => <Skeleton type={DISPLAY_INFO} key={key} />)
          ) : _conversations.data?.length ? (
            <Memoize
              memoizedComponent={ConversationsList}
              userId={userId}
              conversations={_conversations}
            />
          ) : (
            <Box padding='2rem' textAlign='center'>
              {window.navigator.onLine &&
              _conversations.status === 'fulfilled' ? (
                <>
                  <PeopleAltIcon fontSize='large' />
                  <br />
                  <br />
                  Hi,{' '}
                  <Box component='span' fontWeight='bold'>
                    {userFirstname}
                  </Box>
                  !
                  <br />
                  <br />
                  - You have no conversations yet.
                  <br />
                  <br />
                  - Your list of colleagues would appear here.
                  <br />
                  <br />- Search for and add a colleague to begin a conversation
                  with them.
                </>
              ) : (
                <>
                  <CloudOffIcon fontSize='large' />
                  <br />
                  <br />
                  Can't load conversations. You seem to be offline
                </>
              )}
            </Box>
          )}
        </Memoize>
        <Memoize memoizedComponent={TabPanel} value={value} index={1}>
          <Box padding='2rem' textAlign='center'>
            Not available yet.
          </Box>
        </Memoize>
      </Box>
    </Box>
  );
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const name = (value === 0 ? CV : CR).toLowerCase();
  const translateVal = (index === value ? 0 : index - value) * 100;
  const tabPanelRef = React.useRef<any>();

  const setInertness = useCallback(
    (e: any) => {
      e.target.inert = value !== index;

      delay(50).then(() => {
        if (e.target.scrollHeight > e.target.offsetHeight) {
          e.target.classList.remove('remove-scroll-fader');
        } else {
          e.target.classList.add('remove-scroll-fader');
        }
      });
    },
    [value, index]
  );

  React.useEffect(() => {
    if (tabPanelRef.current) {
      addEventListenerOnce(tabPanelRef.current, setInertness, '', {
        capture: true
      });
      addEventListenerOnce(tabPanelRef.current, setInertness, 'resize', {
        capture: true
      });

      if (/fulfilled|settled/.test(other.status)) {
        setInertness({ target: tabPanelRef.current });
      }
    }
  }, [setInertness, other.status]);

  return (
    <>
      <section
        role='tabpanel'
        id={name}
        style={{
          transform: `translateX(${translateVal}%)`,
          WebkitTransform: `translateX(${translateVal}%)`,
          OTransform: `translateX(${translateVal}%)`
        }}
        ref={tabPanelRef}
        className={`chat-tab-panel ${
          value !== index ? 'hide-scroll-fader' : ''
        } ${
          other.status === 'pending'
            ? 'hidden'
            : value === index
            ? 'auto'
            : 'hidden'
        } custom-scroll-bar`}
        aria-labelledby={index}>
        <Box>{children}</Box>
      </section>
      <Box className='scroll-bar-fader' />
    </>
  );
}

export default ChatLeftPane;
