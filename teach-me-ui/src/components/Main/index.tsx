import React, { useEffect } from 'react';
import { Switch, Route, Redirect, Link, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import Row from 'react-bootstrap/Row';

import ChatIcon from '@material-ui/icons/Chat';
import Badge from '@material-ui/core/Badge';

import { Nav, Gallery } from '../crumbs';
import Home from './Home';
import About from '../Index/About';
import Support from '../Index/Support';
import Profile from './Profile';
import Loader from '../shared/Loaders';
import ModalFrame from '../modals';
import Chat from './Chat';
import Questions from './Q&A';
import QuestionPage from './Q&A/QuestionPage';
import _404 from '../Index/_404';

import createMemo from '../../Memo';
import { dispatch, getState, emitUserOnlineStatus, delay } from '../../utils';
import {
  initWebSocket,
  closeWebSocket,
  triggerNotificationSound,
  getConversations,
  getConversationsMessages
} from '../../actions';
import activateSocketRouters from '../../socket.router';
import {
  APIConversationResponse,
  StatusPropsState,
  UserData,
  FetchState,
  NotificationSoundState
} from '../../types';
import { displayModal } from '../../functions';

interface MainProps {
  signoutStatus: StatusPropsState['status'];
  userToken: string;
  webSocket: WebSocket;
  convosData: APIConversationResponse[];
  notificationSound: NotificationSoundState;
  location: Location;
}

const Memoize = createMemo();

const notifSoundRef = React.createRef<HTMLAudioElement | null>();
let notifSoundEl: HTMLAudioElement | null;

let userInteractedWithApp = false;

const Main = (props: MainProps) => {
  const {
    signoutStatus,
    userToken,
    webSocket: socket,
    convosData,
    notificationSound,
    location
  } = props;
  const { play, toneName, hasEnded, isPlaying, isReady } = notificationSound;
  const notifSoundSrc = `/tones/${toneName}.ogg`;
  const unopened_count = convosData?.reduce(
    (a: number, conversation: APIConversationResponse) =>
      a + (conversation.unread_count ? 1 : 0),
    0
  );

  const history = useHistory();

  // handles notification sound events
  useEffect(() => {
    notifSoundEl = notifSoundRef.current as HTMLAudioElement;

    if (notifSoundEl) {
      notifSoundEl.oncanplaythrough = () => {
        dispatch(triggerNotificationSound({ isReady: true }));
      };
      notifSoundEl.onplaying = () => {
        dispatch(
          triggerNotificationSound({
            isPlaying: true,
            play: true,
            hasEnded: false
          })
        );
      };
      notifSoundEl.onended = () => {
        dispatch(
          triggerNotificationSound({
            isPlaying: false,
            play: false,
            hasEnded: true
          })
        );
      };
      notifSoundEl.onerror = () => {
        notifSoundEl!.src = notifSoundEl!.src.replace('ogg', 'mp3');
      };
    }

    window.onclick = () => {
      userInteractedWithApp = true;
      window.onclick = null;
    };
  }, []);

  useEffect(() => {
    const prevHash = location.hash;
    const hideModal = () => {
      if (/#modal/.test(prevHash)) {
        displayModal(false, false, undefined);
      }
    };

    window.addEventListener('popstate', hideModal);

    return () => {
      window.removeEventListener('popstate', hideModal);
    };
  }, [location.hash]);

  useEffect(() => {
    if (/\/chat/.test(window.location.pathname)) {
      history.replace('/chat/0?0');
    }
  }, [history]);

  useEffect(() => {
    if (notifSoundEl) {
      notifSoundEl.src = notifSoundSrc;
    }
  }, [notifSoundSrc]);

  // handles triggering/playing of notification sound
  useEffect(() => {
    const stopSound = () => {
      notifSoundEl!.pause();
      notifSoundEl!.currentTime = 0;
    };

    if (notifSoundEl && userInteractedWithApp && isReady) {
      if (play) {
        if (!hasEnded || isPlaying) {
          stopSound();
        }

        delay(50).then(() => notifSoundEl?.play());
      } else {
        stopSound();
      }
    }
  }, [play, hasEnded, isReady, isPlaying]);

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
    return (
      <Redirect to={(props.location as any).state?.from || { pathname: '/' }} />
    );
  }

  return (
    <>
      <ModalFrame />
      <Row className='Main fade-in mx-0'>
        <Memoize memoizedComponent={Nav} location={props.location} />
        <Switch>
          <Route
            path={['/', '/index', '/home', '/p/:id']}
            exact
            component={Home}
          />
          <Route path='/about' component={About} />
          <Route path='/support' component={Support} />
          <Route path={['/@:username', '/profile/:id']} component={Profile} />
          <Route path={['/search/:query', '/search']} component={Home} />
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
      <audio className='notification-sound' ref={notifSoundRef as any}>
        <source src={notifSoundSrc} type='audio/ogg' />
        <source src={notifSoundSrc.replace('ogg', 'mp3')} type='audio/mpeg' />
        <p>Your browser doesn't support HTML5 audio.</p>
      </audio>
      <Gallery location={props.location} />
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

const mapStateToProps = (state: {
  signout: FetchState<any>;
  userData: UserData;
  webSocket: WebSocket;
  conversations: FetchState<APIConversationResponse[]>;
  notificationSound: NotificationSoundState;
}) => {
  return {
    signoutStatus: state.signout.status,
    userToken: state.userData.token,
    webSocket: state.webSocket,
    convosData: state.conversations.data,
    notificationSound: state.notificationSound
  };
};

export default connect(mapStateToProps)(Main as any);
