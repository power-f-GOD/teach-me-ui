import React, { useEffect } from 'react';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Row from 'react-bootstrap/Row';

import ChatIcon from '@material-ui/icons/Chat';
import Badge from '@material-ui/core/Badge';

import Nav from '../crumbs/Nav';
import Home from './Home';
import About from '../Index/About';
import Support from '../Index/Support';
import Profile from './Profile';
import ProfileRedirect from './ProfileRedirect';
import Loader from '../shared/Loader';
import ModalFrame from '../modals';
import Chat from './Chat';
import Search from './Search';
import PostPage from './PostPage';
import Questions from './Questions';
import QuestionPage from './QuestionPage';
import _404 from '../Index/_404';

import createMemo from '../../Memo';
import {
  dispatch,
  getState,
  emitUserOnlineStatus
} from '../../functions/utils';
import { initWebSocket, closeWebSocket } from '../../actions/misc';
import activateSocketRouters from '../../socket.router';
import { getConversations, getConversationsMessages } from '../../actions/chat';
import { APIConversationResponse } from '../../constants/interfaces';

const Memoize = createMemo();

const Main = (props: any) => {
  const { signoutStatus, userToken, webSocket: socket, convosData } = props;
  const unopened_count = convosData?.reduce(
    (a: number, conversation: APIConversationResponse) =>
      a + (conversation.unread_count ? 1 : 0),
    0
  );

  useEffect(() => {
    dispatch(initWebSocket(userToken as string));
    activateSocketRouters();

    return () => {
      dispatch(closeWebSocket());
    };
  }, [userToken]);

  useEffect(() => {
    if (socket) {
      socket.addEventListener('open', () => {
        console.log('Sockets shook hands! :)');
        emitUserOnlineStatus()();
      });

      socket.addEventListener('error', () => {
        console.error(
          'Error: Sockets lost hands while trying to make handshake. :('
        );
      });

      socket.addEventListener('close', () => {
        console.log('Sockets called it a day! :|');
        emitUserOnlineStatus(false, !navigator.onLine, {
          message: navigator.onLine ? "You're disconnected." : null
        })();
      });

      if (!getState().conversations.data.length) {
        dispatch(getConversations()(dispatch));
        dispatch(getConversationsMessages('getting new')(dispatch));
      }
    }
  }, [socket]);

  if (signoutStatus === 'pending') {
    return <Loader />;
  }

  if (/signin|signup/.test(props.location.pathname)) {
    //redirect to actual URL user was initially trying to access when wasn't authenticated
    return <Redirect to={props.location.state?.from || { pathname: '/' }} />;
  }

  return (
    <>
      <ModalFrame />
      <Row className='Main fade-in mx-0'>
        <Memoize
          memoizedComponent={Nav}
          for='main'
          isAuthenticated={!!userToken}
        />
        <Switch>
          <Route path={['/', '/index', '/home']} exact component={Home} />
          <Route path='/about' component={About} />
          <Route path='/support' component={Support} />
          <Route path='/p/:id' component={PostPage} />
          <Route path='/@:userId' component={Profile} />
          <Route path='/profile/:id' component={ProfileRedirect} />
          <Route path={['/search/:query', '/search']} component={Search} />
          <Route
            path={['/questions', '/questions/tagged/:tag']}
            component={Questions}
          />
          <Route path='/question/:id' component={QuestionPage} />
          <Route path='/chat/:convoId' component={Chat} />
          <Route component={_404} />
        </Switch>
        <Link
          to='/chat/0?0'
          className={`chat-open-button ${unopened_count ? 'ripple' : ''} ${
            /chat/.test(props.location.pathname) ? 'hide' : ''
          }`}>
          <Badge badgeContent={unopened_count} color='error'>
            <ChatIcon fontSize='inherit' />
          </Badge>
        </Link>
      </Row>
    </>
  );
};

document.addEventListener('visibilitychange', () => {
  emitUserOnlineStatus(
    window.navigator.onLine &&
      (getState().webSocket ?? ({} as WebSocket)).readyState !== 1,
    false
  )();
});

const mapStateToProps = (state: any) => {
  return {
    signoutStatus: state.signout.status,
    userToken: state.userData.token,
    webSocket: state.webSocket,
    convosData: state.conversations.data
  };
};

export default connect(mapStateToProps)(Main);
