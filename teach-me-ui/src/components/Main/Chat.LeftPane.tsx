import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';

import queryString from 'query-string';

import Col from 'react-bootstrap/Col';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import BlockIcon from '@material-ui/icons/Block';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';

import {
  chatState,
  getConversationInfo,
  conversationMessages
} from '../../actions/chat';
import { dispatch, addEventListenerOnce, delay } from '../../functions/utils';
import {
  ChatState,
  ConversationInfo,
  APIConversationResponse,
  SearchState,
  APIMessageResponse
} from '../../constants/interfaces';
import { Skeleton, DISPLAY_INFO } from '../crumbs/Loader';
import {
  getConversationMessages,
  conversation,
  conversationInfo,
  conversations
} from '../../actions/chat';
import { ChatTimestamp, ChatStatus } from './Chat.crumbs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
  [key: string]: any;
}

interface ChatLeftPaneProps {
  conversations: SearchState;
  rooms?: ConversationInfo[];
  userId: string;
  userFirstname: string;
  handleSetActivePaneIndex(index: number): Function;
}

const [CV, CR] = ['Conversations', 'Classrooms'];

const ChatLeftPane = (props: ChatLeftPaneProps) => {
  const {
    conversations: _conversations,
    userId,
    userFirstname,
    handleSetActivePaneIndex
  } = props;
  const { pathname } = window.location;
  const convos = (props.conversations.data ?? []) as Partial<
    APIConversationResponse
  >[];

  const [recent, setRecent] = React.useState<number>(0);
  const [value, setValue] = React.useState<number>(0);

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const handleChatClick = useCallback(
    (chatInfo: ChatState, extra: { convoId: string; userId: string }) => {
      return (e: any) => {
        const { id, cid } = queryString.parse(window.location.search);
        const { convoId, userId } = extra;

        delay(300).then(() => {
          handleSetActivePaneIndex(1)();
        });

        if (cid === convoId || userId === id) {
          const queryString = window.location.search.replace(
            'chat=min',
            'chat=open'
          );

          dispatch(chatState({ queryString }));
          e.preventDefault();
          window.history.replaceState(
            {},
            '',
            window.location.pathname + queryString
          );
          return;
        }

        dispatch(conversationInfo({ user_typing: '' }));

        if (window.navigator.onLine) {
          dispatch(getConversationInfo(userId)(dispatch));
          dispatch(
            getConversationMessages(convoId, 'pending', 'loading new')(dispatch)
          );
          delay(1500).then(() => {
            dispatch(
              conversations({ data: [{ unread_count: 0, _id: convoId }] })
            );
          });
        } else {
          dispatch(
            conversationInfo({
              status: 'settled',
              err: true,
              online_status: 'OFFLINE'
            })
          );
          dispatch(
            conversationMessages({ status: 'pending', err: true, data: [] })
          );
        }

        dispatch(chatState(chatInfo));
        dispatch(conversation(convoId));
      };
    },
    [handleSetActivePaneIndex]
  );

  return (
    <Box width='100%'>
      <AppBar position='static'>
        <Tabs
          className='tab-links-container'
          value={value}
          onChange={handleChange}
          aria-label='Chat left pane tab panels'>
          <Tab label={CV} {...allyProps(0)} style={{ minWidth: '50%' }} />
          <Tab label={CR} {...allyProps(1)} style={{ minWidth: '50%' }} />
        </Tabs>
      </AppBar>
      <Box className='tab-panels-wrapper d-flex' position='relative'>
        <TabPanel value={value} index={0} status={_conversations.status}>
          {_conversations.status === 'pending' && !_conversations.err ? (
            Array(Math.floor(window.innerHeight / 60))
              .fill('')
              .map((_, key) => <Skeleton type={DISPLAY_INFO} key={key} />)
          ) : convos.length ? (
            convos.map((conversation, i) => {
              const {
                avatar,
                conversation_name: displayName,
                associated_user_id: _userId,
                _id: convoId,
                last_message,
                friendship,
                participants,
                online_status,
                user_typing,
                unread_count
              } = conversation ?? {};
              const hasRecent: boolean = { ...(last_message as any) }.is_recent;

              if (hasRecent) setRecent(i);

              delete (last_message as any)?.is_recent;

              const lastMessageTimestamp = last_message?.date ?? Date.now();
              const lastMessageDate = new Date(
                Number(lastMessageTimestamp)
              ).toDateString();
              const lastMessageDateString = new Date(lastMessageTimestamp)
                .toLocaleString()
                .split(',')[0];
              const todaysDate = new Date().toDateString();
              const todaysDateString = new Date()
                .toLocaleString()
                .split(',')[0];
              const lastMessageSentYesterday =
                Math.abs(
                  ((new Date(todaysDate) as any) -
                    (new Date(lastMessageDate) as any)) as any
                ) /
                  864e5 ===
                1;
              const _queryString = `${pathname}?chat=open&id=${_userId}&cid=${convoId}`;
              const _chatState: ChatState = {
                isOpen: true,
                isMinimized: false,
                queryString: _queryString
              };

              return (
                <NavLink
                  to={_queryString}
                  className={`tab-panel-item ${
                    !friendship ? 'uncolleagued' : ''
                  } ${recent === i ? 'recent' : ''}`}
                  key={convoId}
                  isActive={(_match, location) =>
                    Boolean(
                      convoId &&
                        queryString.parse(location.search)?.cid === convoId
                    )
                  }
                  onClick={handleChatClick(
                    { ..._chatState },
                    { convoId: String(convoId), userId: String(_userId) }
                  )}>
                  <Col className='colleague-name'>
                    <Badge
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                      }}
                      className={online_status?.toLowerCase() ?? 'offline'}
                      overlap='circle'
                      variant='dot'>
                      <Avatar
                        component='span'
                        className='chat-avatar mr-2'
                        alt={displayName}
                        src={`/images/${avatar ?? 'avatar-1.png'}`}
                      />
                    </Badge>{' '}
                    <Box width='100%' maxWidth='calc(100% - 3.65rem)'>
                      <Box className='display-name-wrapper'>
                        <Box className='display-name'>{displayName}</Box>
                        <ChatTimestamp
                          className={`${
                            conversation.unread_count
                              ? 'theme-secondary-lighter'
                              : ''
                          }`}
                          timestamp={
                            lastMessageSentYesterday
                              ? 'Yesterday'
                              : todaysDateString !== lastMessageDateString
                              ? lastMessageDateString
                              : last_message?.date ?? 0
                          }
                        />
                      </Box>
                      {friendship && (
                        <Box
                          className='message-badge-wrapper d-flex justify-content-between'
                          maxWidth='100%'
                          width='100%'>
                          <Box
                            className={`last-message mt-1 ${
                              last_message?.deleted ? 'font-italic' : ''
                            } ${user_typing ? 'theme-secondary-lightest' : ''}`}
                            maxWidth={
                              unread_count ? 'calc(100% - 2.25rem)' : '100%'
                            }>
                            {!last_message ? (
                              <Box className='new-conversation-tag'>NEW</Box>
                            ) : (
                              <>
                                <Box
                                  position='absolute'
                                  className={user_typing ? 'show' : 'hide'}>
                                  typing...
                                </Box>
                                <Box className={user_typing ? 'hide' : 'show'}>
                                  <ChatStatus
                                    type={
                                      last_message?.sender_id === userId
                                        ? 'outgoing'
                                        : 'incoming'
                                    }
                                    shouldUpdate={
                                      last_message?.delivered_to!?.length +
                                      last_message?.seen_by!?.length
                                    }
                                    participants={participants as string[]}
                                    message={last_message as APIMessageResponse}
                                    userId={userId as string}
                                  />{' '}
                                  {last_message?.deleted ? (
                                    last_message?.sender_id === userId ? (
                                      <>
                                        <BlockIcon fontSize='inherit' /> You
                                        deleted this message
                                      </>
                                    ) : (
                                      <>
                                        <BlockIcon fontSize='inherit' /> You
                                        can't see this message
                                      </>
                                    )
                                  ) : (
                                    last_message?.message
                                  )}
                                </Box>
                              </>
                            )}
                          </Box>
                          <Badge
                            className={unread_count ? 'show-badge' : ''}
                            badgeContent={unread_count}
                            max={999}
                          />
                        </Box>
                      )}
                    </Box>
                  </Col>
                </NavLink>
              );
            })
          ) : (
            <Box padding='2rem' textAlign='center'>
              {window.navigator.onLine ? (
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
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Box padding='2rem' textAlign='center'>
            Not available yet.
          </Box>
        </TabPanel>
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

      delay(10).then(() => {
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
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translateX(${translateVal}%)`,
          WebkitTransform: `translateX(${translateVal}%)`,
          OTransform: `translateX(${translateVal}%)`,
          overflowY:
            other.status === 'pending'
              ? 'hidden'
              : value === index
              ? 'auto'
              : 'hidden',
          opacity: value === index ? 1 : 0.8,
          minWidth: '100%'
        }}
        ref={tabPanelRef}
        className={`tab-panel ${
          value !== index ? 'hide-scroll-fader' : ''
        } custom-scroll-bar`}
        aria-labelledby={index}>
        <Box>{children}</Box>
      </section>
      <Box className='scroll-bar-fader' />
    </>
  );
}

function allyProps(index: any) {
  return {
    id: index,
    'aria-controls': index,
    className: 'tab-link'
  };
}

export default ChatLeftPane;
