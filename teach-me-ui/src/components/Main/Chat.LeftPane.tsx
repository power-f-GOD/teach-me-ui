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

import { chatState, getConversationInfo } from '../../actions/chat';
import { dispatch } from '../../functions/utils';
import {
  ChatState,
  ConversationInfo,
  APIConversationResponse,
  SearchState
} from '../../constants/interfaces';
import { Skeleton, DISPLAY_INFO } from '../crumbs/Loader';
import {
  getConversationMessages,
  conversation,
  conversationInfo
} from '../../actions/chat';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
  [key: string]: any;
}

interface ChatLeftPaneProps {
  conversations: SearchState;
  rooms?: ConversationInfo[];
}

const [CV, CR] = ['Conversations', 'Classrooms'];

const ChatLeftPane = (props: ChatLeftPaneProps) => {
  const [value, setValue] = React.useState<number>(0);
  const { conversations } = props;
  const { pathname } = window.location;
  const convos = (props.conversations.data ?? []) as Partial<
    APIConversationResponse
  >[];

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const handleChatClick = useCallback(
    (chatInfo: ChatState, extra: { convoId: string; username: string }) => {
      return (e: any) => {
        const { id, cid } = queryString.parse(window.location.search);
        const { convoId, username } = extra;

        if (cid === convoId || username === id) {
          e.preventDefault();
          return;
        }

        dispatch(conversationInfo({ user_typing: '' }));
        dispatch(getConversationInfo(username)(dispatch));
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
          Array(10)
            .fill('')
            .map((_, key) => <Skeleton type={DISPLAY_INFO} key={key} />)
        ) : !!convos[0] ? (
          convos.map((conversation) => {
            const {
              avatar,
              conversation_name: displayName,
              associated_username: username,
              _id: convoId
            } = conversation;
            const _queryString = `${pathname}?chat=open&id=${username}&cid=${convoId}`;
            const _chatState: ChatState = {
              isOpen: true,
              isMinimized: false,
              queryString: _queryString
            };

            return (
              <NavLink
                to={_queryString}
                className='tab-panel-item'
                key={convoId}
                isActive={(_match, location) =>
                  Boolean(
                    convoId &&
                      queryString.parse(location.search)?.cid === convoId
                  )
                }
                onClick={handleChatClick(
                  { ..._chatState },
                  { convoId: String(convoId), username: String(username) }
                )}>
                <Col className='colleague-name'>
                  <Badge
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                    className='offline'
                    overlap='circle'
                    variant='dot'>
                    <Avatar
                      component='span'
                      className='chat-avatar mr-2'
                      alt={displayName}
                      src={`/images/${avatar ?? 'avatar-1.png'}`}
                    />
                  </Badge>{' '}
                  <Box>{displayName}</Box>
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
        {/* {rooms.map((room) => {
          const _pathname = `${pathname}?chat=open&type=classroom&id=${
            room.conversationId
          }&name=${room.data!.displayName}`;
          const chatInfo: ChatState = {
            queryString: _pathname
          };

          return (
            <NavLink
              to={_pathname}
              className='tab-panel-item'
              key={room.data!.displayName}
              isActive={(_match, location) =>
                queryString.parse(location.search)?.id === room.conversationId
              }
              onClick={handleChatClick(
                { ...chatInfo },
                {
                  convoId: room.conversationId as string,
                  username: room.data!.displayName as string
                }
              )}>
              {room.data!.displayName}
            </NavLink>
          );
        })} */}
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
        value === index ? 'show' : 'hide'
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
