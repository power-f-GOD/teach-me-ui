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
import ForumIcon from '@material-ui/icons/Forum';
import ChatIcon from '@material-ui/icons/Chat';

import {
  chatState,
  conversationMessages,
  conversationsMessages
} from '../../actions/chat';
import { dispatch, addEventListenerOnce, delay } from '../../functions/utils';
import {
  ChatState,
  APIConversationResponse,
  SearchState,
  APIMessageResponse,
  ConversationMessages
} from '../../constants/interfaces';
import { Skeleton, DISPLAY_INFO } from '../crumbs/Loader';
import {
  getConversationMessages,
  conversation,
  conversations
} from '../../actions/chat';
import { ChatTimestamp, ChatStatus } from './Chat.crumbs';
import createMemo from '../../Memo';
import { scrollViewRef } from './Chat.MiddlePane';
import { getState } from '../../appStore';

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
  handleSetActivePaneIndex(index: number): Function;
}

const Memoize = createMemo();

const [CV, CR] = ['Conversations', 'Classrooms'];

const allyProps = (index: any) => {
  return {
    id: index,
    'aria-controls': index,
    className: 'tab-link'
  };
};

const ChatLeftPane = (props: ChatLeftPaneProps) => {
  const {
    conversations: _conversations,
    userId,
    userFirstname,
    handleSetActivePaneIndex
  } = props;
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
      <Box className='tab-panels-wrapper d-flex' position='relative'>
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
              memoizedComponent={PaneItems}
              userId={userId}
              conversations={_conversations}
              handleSetActivePaneIndex={handleSetActivePaneIndex}
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
        className={`tab-panel ${value !== index ? 'hide-scroll-fader' : ''} ${
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

function PaneItems(props: {
  conversations: SearchState;
  userId: string;
  handleSetActivePaneIndex(index: number): Function;
}) {
  const {
    conversations: _conversations,
    userId,
    handleSetActivePaneIndex
  } = props;
  const convos = (_conversations.data ?? []) as Partial<
    APIConversationResponse
  >[];

  return (
    <>
      {convos.map((conversation, i) => {
        const {
          last_message,
          unread_count,
          user_typing,
          colleague
        } = conversation;

        return (
          <Memoize
            memoizedComponent={PaneItem}
            conversation={conversation}
            forceUpdate={
              '' +
              last_message?.id +
              last_message?.delivered_to +
              last_message?.seen_by +
              last_message?.deleted +
              unread_count +
              user_typing +
              colleague?.online_status
            }
            index={i}
            userId={userId}
            handleSetActivePaneIndex={handleSetActivePaneIndex}
            key={i}
          />
        );
      })}
    </>
  );
}

function PaneItem({
  conversation: _conversation,
  userId,
  handleSetActivePaneIndex,
  index
}: {
  conversation: Partial<APIConversationResponse>;
  userId: string;
  index: number;
  handleSetActivePaneIndex(index: number): Function;
  forceUpdate: string;
}) {
  const {
    conversation_name: displayName,
    id: convoId,
    last_message,
    friendship,
    participants,
    user_typing,
    unread_count,
    created_at,
    last_activity,
    colleague
  } = _conversation ?? {};
  const { id: _userId, online_status, profile_photo } = colleague || {};
  const isRecent: boolean = { ...(last_message as any) }.is_recent;

  const [recent, setRecent] = React.useState<number>(0);

  if (isRecent) setRecent(index);

  delete (last_message as any)?.is_recent;

  const lastMessageTimestamp =
    last_message?.date ?? last_activity ?? Date.now();
  const lastMessageDate = new Date(Number(lastMessageTimestamp)).toDateString();
  const lastMessageDateString = new Date(lastMessageTimestamp)
    .toLocaleString()
    .split(',')[0];
  const todaysDate = new Date().toDateString();
  const todaysDateString = new Date().toLocaleString().split(',')[0];
  const lastMessageSentYesterday =
    Math.abs(
      ((new Date(todaysDate) as any) -
        (new Date(lastMessageDate) as any)) as any
    ) /
      864e5 ===
    1;
  const _queryString = `?id=${_userId}&chat=o1&cid=${convoId}`;
  const _chatState: ChatState = {
    isOpen: true,
    isMinimized: false,
    queryString: _queryString
  };

  const navLinkTo = useCallback(
    ({ pathname }: any) => pathname + _queryString,
    [_queryString]
  );

  const navLinkActive = useCallback(
    (_match: any, location: any) => {
      return Boolean(
        convoId && queryString.parse(location.search)?.cid === convoId
      );
    },
    [convoId]
  );

  const handleChatClick = useCallback(
    (chatInfo: ChatState, extra: { convoId: string; userId: string }) => {
      return (e: any) => {
        const { id, cid } = queryString.parse(window.location.search);
        const { convoId, userId } = extra;
        const {
          conversation: _conversation,
          conversationMessages: _conversationMessages
        } = getState() as {
          //using getState here to prevent rerenders that would be caused if props is used
          conversation: APIConversationResponse;
          conversationMessages: ConversationMessages;
        };
        const { id: prevChatConvoId } = _conversation;
        const prevChatConvoMessages = _conversationMessages.data;

        if (window.innerWidth < 992) {
          const scrollView = scrollViewRef.current;

          if (scrollView) {
            scrollView.scrollTop = scrollView.scrollHeight;
          }
        }

        delay(300).then(() => {
          handleSetActivePaneIndex(1)();
        });

        if (cid === convoId || userId === id || prevChatConvoId === convoId) {
          const queryString = window.location.search.replace(
            'chat=m2',
            'chat=o1'
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

        //update store for previous chat before updating/populating current chat
        if (prevChatConvoId && prevChatConvoMessages?.length) {
          dispatch(
            conversationsMessages({
              convoId: prevChatConvoId,
              statusText: 'replace messages',
              data: { [prevChatConvoId]: [...prevChatConvoMessages] }
            })
          );
        }

        dispatch(conversation(convoId, { user_typing: '' }));
        dispatch(
          getConversationMessages(convoId, 'pending', 'loading new')(dispatch)
        );

        if (window.navigator.onLine) {
          // dispatch(getConversationInfo(userId)(dispatch));

          //delay so that state conversation unread_count is not updated immediately when the conversation opens
          delay(1250).then(() => {
            dispatch(
              conversations({ data: [{ unread_count: 0, id: convoId }] })
            );
          });
        } else {
          dispatch(
            conversation(convoId, { colleague: { online_status: 'OFFLINE' } })
          );
          dispatch(conversationMessages({ status: 'pending', err: true }));
        }

        dispatch(chatState(chatInfo));
        dispatch(conversation(convoId, {}));
      };
    },
    [handleSetActivePaneIndex]
  );

  return (
    <NavLink
      to={navLinkTo}
      className={`tab-panel-item ${!friendship ? 'uncolleagued' : ''} ${
        recent === index ? 'recent' : ''
      }`}
      key={convoId}
      isActive={navLinkActive}
      onClick={handleChatClick(
        { ..._chatState },
        { convoId: String(convoId), userId: String(_userId) }
      )}>
      <Col className='conversation-name-wrapper'>
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
            className={'chat-avatar mr-2'}
            alt={displayName}
            src={profile_photo || ''}
          />
        </Badge>{' '}
        <Box width='100%' maxWidth='calc(100% - 3.65rem)'>
          <Box className='display-name-wrapper'>
            <Box className='display-name'>{displayName}</Box>

            <ChatTimestamp
              className={`${
                _conversation.unread_count ? 'theme-secondary-lightest' : ''
              }`}
              timestamp={
                lastMessageSentYesterday
                  ? 'Yesterday'
                  : todaysDateString !== lastMessageDateString
                  ? lastMessageDateString
                  : last_message?.date ?? created_at ?? 0
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
                }`}
                maxWidth={unread_count ? 'calc(100% - 2.25rem)' : '100%'}
                title={last_message?.message ?? ''}>
                {!last_message ? (
                  <Box className='new-conversation-tag'>NEW</Box>
                ) : (
                  <>
                    <Box
                      position='absolute'
                      className={`theme-secondary-lightest font-normal ${
                        user_typing ? 'show font-bold' : 'hide'
                      }`}>
                      typing...
                    </Box>
                    <Box
                      className={`${user_typing ? 'hide' : 'show'} ${
                        unread_count ? 'font-bold' : ''
                      } pr-1`}>
                      <ChatStatus
                        type={
                          last_message?.sender_id === userId
                            ? 'outgoing'
                            : 'incoming'
                        }
                        isRecent={!!last_message.pipe}
                        forceUpdate={
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
                            <BlockIcon fontSize='inherit' /> You deleted this
                            message
                          </>
                        ) : (
                          <>
                            <BlockIcon fontSize='inherit' /> You can't see this
                            message
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
                max={9999}
              />
            </Box>
          )}
        </Box>
      </Col>
    </NavLink>
  );
}

export default ChatLeftPane;
