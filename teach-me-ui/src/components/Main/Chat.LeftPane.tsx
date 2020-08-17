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

import { chatState, getConversationInfo } from '../../actions/chat';
import { dispatch } from '../../functions/utils';
import {
  ChatState,
  ConversationInfo,
  APIConversationResponse,
  SearchState,
  UserData,
  APIMessageResponse
} from '../../constants/interfaces';
import { Skeleton, DISPLAY_INFO } from '../crumbs/Loader';
import {
  getConversationMessages,
  conversation,
  conversationInfo
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
  userData: UserData;
}

const [CV, CR] = ['Conversations', 'Classrooms'];

const ChatLeftPane = (props: ChatLeftPaneProps) => {
  const [value, setValue] = React.useState<number>(0);
  const { conversations, userData } = props;
  const { pathname } = window.location;
  const convos = (props.conversations.data ?? []) as Partial<
    APIConversationResponse
  >[];

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const handleChatClick = useCallback(
    (chatInfo: ChatState, extra: { convoId: string; userId: string }) => {
      return (e: any) => {
        const { id, cid } = queryString.parse(window.location.search);
        const { convoId, userId } = extra;

        if (cid === convoId || userId === id) {
          e.preventDefault();
          return;
        }

        dispatch(conversationInfo({ user_typing: '' }));
        dispatch(getConversationInfo(userId)(dispatch));
        dispatch(getConversationMessages(convoId)(dispatch));
        dispatch(chatState(chatInfo));
        dispatch(conversation(convoId));
      };
    },
    []
  );

  return (
    <Box width='100%'>
      <AppBar position='static'>
        <Tabs
          className='tab-links-container'
          value={value}
          onChange={handleChange}
          aria-label='Chat left pane tab panels'>
          <Tab label={CV} {...allyProps(0)} />
          <Tab label={CR} {...allyProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel
        value={value}
        index={0}
        style={{
          overflowY: conversations.status === 'pending' ? 'hidden' : 'auto'
        }}>
        {conversations.status === 'pending' ? (
          Array(Math.floor(window.innerHeight / 60))
            .fill('')
            .map((_, key) => <Skeleton type={DISPLAY_INFO} key={key} />)
        ) : !!convos[0] ? (
          convos.map((conversation) => {
            const {
              avatar,
              conversation_name: displayName,
              associated_user_id: userId,
              _id: convoId,
              last_message,
              friendship,
              participants,
              online_status
            } = conversation;
            const lastMessageTimestamp = last_message?.date ?? Date.now();
            const lastMessageDate = new Date(
              Number(lastMessageTimestamp)
            ).toDateString();
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
            const _queryString = `${pathname}?chat=open&id=${userId}&cid=${convoId}`;
            const _chatState: ChatState = {
              isOpen: true,
              isMinimized: false,
              queryString: _queryString
            };
            // console.log('last-message:', last_message);
            return (
              <NavLink
                to={_queryString}
                className={`tab-panel-item ${
                  !friendship ? 'uncolleagued' : ''
                }`}
                key={convoId}
                isActive={(_match, location) =>
                  Boolean(
                    convoId &&
                      queryString.parse(location.search)?.cid === convoId
                  )
                }
                onClick={handleChatClick(
                  { ..._chatState },
                  { convoId: String(convoId), userId: String(userId) }
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
                  <Box width='100%' maxWidth='calc(100% - 3.25rem)'>
                    <Box className='display-name-wrapper'>
                      <Box className='display-name'>{displayName}</Box>
                      <ChatTimestamp
                        timestamp={
                          lastMessageSentYesterday
                            ? 'Yesterday'
                            : todaysDateString !== lastMessageDateString
                            ? lastMessageDateString
                            : last_message?.date ?? 0
                        }
                      />
                    </Box>
                    <Box
                      className={`last-message mt-1 ${
                        last_message?.deleted ? 'font-italic' : ''
                      }`}>
                      <ChatStatus
                        type={
                          last_message?.sender_id === userData.id
                            ? 'outgoing'
                            : 'incoming'
                        }
                        shouldUpdate={
                          last_message?.delivered_to!?.length +
                          last_message?.seen_by!?.length
                        }
                        participants={participants as string[]}
                        message={last_message as APIMessageResponse}
                        userId={userData.id}
                      />{' '}
                      {last_message?.deleted ? (
                        last_message?.sender_id === userData.id ? (
                          <>
                            <BlockIcon fontSize='inherit' /> You deleted this
                            message
                          </>
                        ) : (
                          <>
                            <BlockIcon fontSize='inherit' /> User changed their
                            mind about message
                          </>
                        )
                      ) : (
                        last_message?.message
                      )}
                    </Box>
                  </Box>
                </Col>
              </NavLink>
            );
          })
        ) : (
          <Box padding='2rem' textAlign='center'>
            You have no conversations yet.
          </Box>
        )}
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box padding='2rem' textAlign='center'>
          Not available yet.
        </Box>
      </TabPanel>
    </Box>
  );
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const name = (value === 0 ? CV : CR).toLowerCase();

  return (
    <Box
      component='section'
      role='tabpanel'
      hidden={value !== index}
      id={name}
      className={`tab-panel ${
        value === index ? 'animate-show' : ''
      } custom-scroll-bar`}
      aria-labelledby={index}
      {...other}>
      <Box>{children}</Box>
    </Box>
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
