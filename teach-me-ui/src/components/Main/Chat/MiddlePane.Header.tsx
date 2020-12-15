import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  createRef,
  useContext
} from 'react';
import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import CloseIcon from '@material-ui/icons/Close';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import DeleteIcon from '@material-ui/icons/Delete';
import MenuIcon from '@material-ui/icons/MenuRounded';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PersonIcon from '@material-ui/icons/Person';
import FilterNoneRoundedIcon from '@material-ui/icons/FilterNoneRounded';
import ReplyRoundedIcon from '@material-ui/icons/ReplyRounded';

import {
  APIMessageResponse,
  Partial,
  OnlineStatus
} from '../../../constants/interfaces';
import {
  chatState,
  conversationMessages,
  conversations,
  conversation,
  conversationsMessages
} from '../../../actions/chat';
import {
  dispatch,
  delay,
  formatMapDateString,
  timestampFormatter,
  addEventListenerOnce,
  emitUserOnlineStatus,
  promisedDispatch,
  getState
} from '../../../functions/utils';
import { placeHolderDisplayName } from './Chat';
import {
  CHAT_MESSAGE_DELETED,
  CHAT_MESSAGE_DELETED_FOR
} from '../../../constants/chat';
import { ConfirmDialog, SelectedMessageValue, ActionChoice } from './crumbs';
import { displaySnackbar } from '../../../actions';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { ChatMiddlePaneProps, Memoize } from './MiddlePane';
import { messageBox } from './MiddlePane.MessageBox';

export const MiddlePaneHeaderContext = createContext(
  {} as Partial<ChatMiddlePaneProps>
);
export const ColleagueNameAndStatusContext = createContext(
  {} as Partial<ChatMiddlePaneProps>
);

const moreOptionsContainerRef: any = createRef<HTMLElement | any>();
const messageActionsWrapperRef: any = createRef<HTMLInputElement | null>();
const headerNameControlWrapperRef: any = createRef<HTMLInputElement | null>();

let messageActionsWrapper: HTMLElement | any = null;
let moreOptionsContainer: HTMLElement | any = null;
let headerNameControlWrapper: HTMLElement | any = null;

export const MiddlePaneHeader = (props: {
  convoId: string;
  convoOnlineStatus: OnlineStatus;
  setMessageHead: Function;
  setSelectedMessages: Function;
  setClearSelections: Function;
  selectedMessages: { [key: string]: any };
  webSocket: WebSocket;
}) => {
  const {
    convoId,
    convoOnlineStatus,
    setMessageHead,
    selectedMessages,
    setClearSelections,
    setSelectedMessages,
    webSocket: socket
  } = props;
  const { windowWidth } = useContext(MiddlePaneHeaderContext);
  const numOfSelectedMessages = Object.keys(selectedMessages).length;

  const [
    moreOptionsContainerIsVisible,
    setMoreOptionsIsVisible
  ] = useState<boolean>(false);

  const handleCloseChatClick = useCallback(() => {
    //store/save updated convoMessages in state before close
    if (convoId) {
      dispatch(
        conversationsMessages({
          convoId,
          statusText: 'replace messages',
          data: { [convoId]: [...getState().conversationMessages.data] }
        })
      );
    }

    delay(100).then(() => {
      dispatch(conversation(''));
      dispatch(conversationMessages({ data: [] }));
    });
  }, [convoId]);

  const toggleMoreOptionsPopover = useCallback(() => {
    setMoreOptionsIsVisible((prev) => !prev);
  }, []);

  const hideMoreOptionsOnClick = useCallback(() => {
    setMoreOptionsIsVisible(false);
  }, []);

  const handleUserInfoOptionClick = useCallback(() => {
    dispatch(chatState({ queryParam: '?2' }, true));
  }, []);

  useEffect(() => {
    moreOptionsContainer = moreOptionsContainerRef.current;
    headerNameControlWrapper = headerNameControlWrapperRef.current;

    if (moreOptionsContainer) {
      moreOptionsContainer.inert = true;
    }
  }, []);

  useEffect(() => {
    if (moreOptionsContainer) {
      addEventListenerOnce(moreOptionsContainer, () => {
        moreOptionsContainer.inert = !moreOptionsContainerIsVisible;
      });
    }
  }, [moreOptionsContainerIsVisible]);

  useEffect(() => {
    if (headerNameControlWrapper) {
      headerNameControlWrapper.inert = !!numOfSelectedMessages;
    }
  }, [numOfSelectedMessages]);

  return (
    <>
      <Row
        className={`chat-header-name_control-wrapper ${
          convoId ? '' : 'chat-bg'
        } px-2 mx-0`}
        ref={headerNameControlWrapperRef}>
        <Memoize
          memoizedComponent={MiddlePandeHeaderConversationNameAndStatus}
          convoOnlineStatus={convoOnlineStatus}
          handleUserInfoOptionClick={handleUserInfoOptionClick}
        />

        <Col as='span' className='chat-header-controls p-0'>
          <Box component='span' className='chat-header-control-wrapper ml-1'>
            {windowWidth! >= 992 && (
              <Link
                to='/'
                className='chat-close-button'
                onClick={handleCloseChatClick}
                aria-label='close chat box'>
                <CloseIcon />
              </Link>
            )}
          </Box>

          {windowWidth! < 992 && (
            <ClickAwayListener
              onClickAway={() =>
                moreOptionsContainerIsVisible
                  ? toggleMoreOptionsPopover()
                  : null
              }>
              <Box
                component='span'
                className='chat-header-control-wrapper more-options-wrapper ml-1'>
                <IconButton
                  className='more-button'
                  onClick={toggleMoreOptionsPopover}
                  aria-label='more'>
                  <MoreVertIcon />
                </IconButton>

                <Container
                  as='span'
                  ref={moreOptionsContainerRef}
                  className={`chat-more-options-container ${
                    moreOptionsContainerIsVisible ? 'show' : 'hide'
                  } d-inline-flex flex-column p-0 w-auto`}
                  onClick={hideMoreOptionsOnClick}>
                  {/* <Button
                    variant='contained'
                    className='user-info-button'
                    onClick={}>
                    <PersonIcon /> User Info
                  </Button> */}
                  <Button
                    variant='contained'
                    className='user-info-button'
                    onClick={handleUserInfoOptionClick}>
                    <PersonIcon /> User Info
                  </Button>
                  <Link
                    to='/'
                    className='chat-close-button'
                    onClick={handleCloseChatClick}
                    aria-label='close chat box'>
                    <CloseIcon /> Close
                  </Link>
                </Container>
              </Box>
            </ClickAwayListener>
          )}
        </Col>
      </Row>

      <Memoize
        memoizedComponent={MiddlePaneHeaderActions}
        inert={!numOfSelectedMessages}
        numOfSelectedMessages={numOfSelectedMessages}
        setMessageHead={setMessageHead}
        selectedMessages={selectedMessages}
        setClearSelections={setClearSelections}
        setSelectedMessages={setSelectedMessages}
        webSocket={socket}
      />
    </>
  );
};

let renderAwayDateTimeout: any;
let _canDisplayAwayDate = false;
let lastSeenForAway = Date.now();

function MiddlePandeHeaderConversationNameAndStatus(props: {
  convoOnlineStatus: OnlineStatus;
  handleUserInfoOptionClick: Function;
}) {
  const { convoOnlineStatus, handleUserInfoOptionClick } = props;
  const {
    convoId,
    convoDisplayName,
    convoProfilePhoto,
    convosErr,
    convoType,
    convoUserTyping,
    convoLastSeen,
    setOnlineStatus,
    windowWidth
  } = useContext(ColleagueNameAndStatusContext);
  const [canDisplayAwayDate, setCanDisplayAwayDate] = useState(false);
  const [lastSeenDate, lastSeenTime] = [
    formatMapDateString(convoLastSeen as number),
    timestampFormatter(convoLastSeen)
  ];
  const lastAwayDate = `away ${
    canDisplayAwayDate ? 'since ' + lastSeenTime + ', ' + lastSeenDate : ''
  }`;
  const lastOnlineDate = `last seen ${lastSeenDate} at ${lastSeenTime.replace(
    ' ',
    ''
  )}`;
  const onlineStatus = convoUserTyping
    ? 'typing...'
    : convoOnlineStatus === 'ONLINE'
    ? 'online'
    : convoOnlineStatus === 'AWAY'
    ? lastAwayDate
    : lastSeenDate
    ? lastOnlineDate
    : '...';

  const handleConversationsMenuClick = useCallback(() => {
    dispatch(chatState({ queryParam: '?0' }));
    promisedDispatch(
      conversations({ data: [{ id: convoId, unread_count: 0 }] })
    ).then(() => {
      dispatch(conversation(convoId!));
    });
  }, [convoId]);

  const displayAwayDate = useCallback(() => {
    renderAwayDateTimeout = setTimeout(() => {
      _canDisplayAwayDate = Date.now() - lastSeenForAway > 300000;

      if (!_canDisplayAwayDate) {
        clearTimeout(renderAwayDateTimeout);
        displayAwayDate();
      }

      if (_canDisplayAwayDate || !lastSeenForAway) {
        clearTimeout(renderAwayDateTimeout);
        setCanDisplayAwayDate(true);
      }
    }, 10000);

    if ((_canDisplayAwayDate = Date.now() - lastSeenForAway > 300000)) {
      clearTimeout(renderAwayDateTimeout);
      setCanDisplayAwayDate(true);
    }
  }, []);

  useEffect(() => {
    if (convoId) {
      setOnlineStatus!(onlineStatus);
    }
  }, [onlineStatus, setOnlineStatus, convoId]);

  useEffect(() => {
    if (convoId) {
      lastSeenForAway = convoLastSeen as number;
      displayAwayDate();

      if (convoOnlineStatus !== 'AWAY') {
        clearTimeout(renderAwayDateTimeout);
        setCanDisplayAwayDate(false);
      }
    }

    return () => {
      renderAwayDateTimeout = null;
      _canDisplayAwayDate = false;
      lastSeenForAway = Date.now();
    };
  }, [convoId, convoOnlineStatus, convoLastSeen, displayAwayDate]);

  return (
    <Col as='span' className='chat-conversation-name-wrapper'>
      {windowWidth! < 992 && (
        <Box
          component='span'
          className='chat-header-control-wrapper conversations-menu-button-wrapper'>
          <IconButton
            className='conversations-menu-button ml-0 mr-1'
            onClick={handleConversationsMenuClick}
            aria-label='see conversations'>
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {convoType === 'ONE_TO_ONE' ? (
        <Box
          component='span'
          className='conversation-name-container d-inline-flex align-items-center'
          onClick={handleUserInfoOptionClick as any}>
          <Badge
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            className={`online-badge ${
              !convosErr ? convoOnlineStatus?.toLowerCase() : 'offline'
            }`}
            overlap='circle'
            variant='dot'>
            <Avatar
              component='span'
              className='chat-avatar'
              alt={convoDisplayName}
              src={convoProfilePhoto}
            />
          </Badge>{' '}
          <Col as='span' className='ml-2 p-0'>
            <Col
              as='span'
              className={`display-name ${
                !convoLastSeen || convosErr ? 'status-hidden' : ''
              } p-0`}>
              {convoDisplayName ?? placeHolderDisplayName}
            </Col>
            <Col
              as='span'
              className={`status ${convoLastSeen && !convosErr ? 'show' : ''} ${
                /typing/.test(onlineStatus) ? 'font-bold' : ''
              } p-0`}>
              {onlineStatus}
            </Col>
          </Col>
        </Box>
      ) : !convoId ? (
        <Col as='span' className='theme-tertiary-darker ml-2 p-0'>
          {placeHolderDisplayName}...
        </Col>
      ) : (
        <>
          <Avatar
            component='span'
            className='chat-avatar ml-0'
            alt='Emmanuel Sunday'
            src={`/images/${convoProfilePhoto}`}
          />
          <Col as='span' className='ml-2 p-0'>
            {convoDisplayName ?? placeHolderDisplayName}
          </Col>
        </>
      )}
    </Col>
  );
}

function MiddlePaneHeaderActions(props: {
  inert: boolean;
  numOfSelectedMessages: number;
  setMessageHead: Function;
  selectedMessages: { [key: string]: SelectedMessageValue };
  setClearSelections: Function;
  setSelectedMessages: Function;
  webSocket: WebSocket;
}) {
  const {
    inert,
    numOfSelectedMessages,
    setMessageHead,
    selectedMessages,
    setClearSelections,
    setSelectedMessages,
    webSocket: socket
  } = props;
  const oneSelected = numOfSelectedMessages === 1;

  const [canShowReplyButton, setCanShowReplyButton] = useState<boolean>(
    oneSelected
  );
  const [
    messageToReply,
    setMessageToReply
  ] = useState<APIMessageResponse | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [dialogAction, setDialogAction] = useState<any>(
    (choice: ActionChoice) => choice
  );
  const [canDeleteForEveryone, setCanDeleteForEveryone] = useState<boolean>(
    true
  );

  const handleClearSelections = useCallback(() => {
    setClearSelections(true);
    delay(10).then(() => setSelectedMessages({}));
  }, [setClearSelections, setSelectedMessages]);

  const handleReplyMessage = useCallback(() => {
    if (oneSelected && messageToReply) {
      messageBox?.focus();
      handleClearSelections();
      setMessageHead(messageToReply.deleted ? null : { ...messageToReply });
    }
  }, [oneSelected, messageToReply, setMessageHead, handleClearSelections]);

  const confirmDeleteMessage = useCallback((): Promise<ActionChoice> => {
    return new Promise((resolve) => {
      let canDeleteForEveryone = true;

      for (const id in selectedMessages) {
        if (
          selectedMessages[id].type === 'incoming' ||
          selectedMessages[id].deleted
        ) {
          canDeleteForEveryone = false;
          break;
        }
      }

      setCanDeleteForEveryone(canDeleteForEveryone);
      setDialogAction(() => (choice: ActionChoice) => {
        resolve(choice);
        setOpenConfirmDialog(false);
      });
      setOpenConfirmDialog(true);
    });
  }, [selectedMessages]);

  const handleCopyMessage = useCallback(() => {
    const selection = window.getSelection();
    const range = document.createRange();
    const container = document.createElement('div');
    const isMulti = numOfSelectedMessages > 1;
    let messages = '';

    for (const id in selectedMessages) {
      const { message, date: _date, sender_username } = selectedMessages[id];
      const [date, time] = [
        new Date(_date).toLocaleDateString(),
        timestampFormatter(_date)
      ];

      if (!message) {
        if (!isMulti) return;
        continue;
      }

      if (isMulti) {
        messages +=
          `[@${sender_username} | ${date} at ${time}]:\n` + message + '\n\n';
      } else {
        messages = message;
      }
    }

    container.className = 'chat-message-selection-data-container';
    container.textContent = messages;
    document.body.appendChild(container);
    range.selectNodeContents(container);
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.execCommand('copy');
    document.body.removeChild(container);
    handleClearSelections();
    dispatch(
      displaySnackbar({
        message: `Message${isMulti ? 's' : ''} copied to clipboard.`,
        severity: 'info',
        open: true,
        autoHide: true,
        timeout: 1600
      })
    );
  }, [selectedMessages, numOfSelectedMessages, handleClearSelections]);

  const handleDeleteMessage = useCallback(() => {
    confirmDeleteMessage().then((choice) => {
      if (choice === 'CANCEL') return;

      const pipe =
        choice === 'DELETE_FOR_EVERYONE'
          ? CHAT_MESSAGE_DELETED
          : CHAT_MESSAGE_DELETED_FOR;

      for (const id in selectedMessages) {
        try {
          if (socket && socket.readyState === socket.OPEN) {
            socket.send(JSON.stringify({ message_id: id, pipe }));
            handleClearSelections();
          } else {
            emitUserOnlineStatus(true, false, {
              open: true,
              message:
                "Something went wrong. Seems you are/were offline. We'll try to reconnect then you can try again.",
              severity: 'info',
              autoHide: false
            });
          }
        } catch (e) {
          emitUserOnlineStatus(false, true, {
            open: true,
            message:
              e +
              'An error occurred. Could not establish connection with server.',
            severity: 'error'
          });
          console.error('An error occurred. Error:', e);
        }
      }
    });
  }, [selectedMessages, confirmDeleteMessage, socket, handleClearSelections]);

  useEffect(() => {
    if (oneSelected) {
      const message = selectedMessages[Object.keys(selectedMessages)[0]];

      setCanShowReplyButton(!message.deleted);
      setMessageToReply(message);
    } else {
      setCanShowReplyButton(false);
    }

    addEventListenerOnce(
      window,
      (e: any) => {
        if (numOfSelectedMessages) {
          if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
            handleCopyMessage();
          }

          if (((e.ctrlKey || e.metaKey) && e.key === 'd') || e.keyCode === 46) {
            e.preventDefault();
            handleDeleteMessage();
          }

          if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            handleReplyMessage();
          }
        }
      },
      'keyup'
    );
  }, [
    oneSelected,
    numOfSelectedMessages,
    setMessageHead,
    selectedMessages,
    handleReplyMessage,
    handleCopyMessage,
    handleDeleteMessage
  ]);

  useEffect(() => {
    if (messageActionsWrapper) {
      messageActionsWrapper.inert = inert;
    }
  }, [inert]);

  useEffect(() => {
    messageActionsWrapper = messageActionsWrapperRef.current;

    if (messageActionsWrapper) {
      messageActionsWrapper.inert = true;
    }
  }, []);

  return (
    <>
      <Container
        fluid
        className='chat-message-actions-wrapper'
        ref={messageActionsWrapperRef}>
        <Row
          className={`chat-message-actions-container ${
            numOfSelectedMessages ? 'open' : ''
          } m-0`}>
          <Box className='chat-action-wrapper text-left'>
            <IconButton
              className='clear-selection-button ml-2'
              onClick={handleClearSelections}
              aria-label='cancel action button'>
              <CloseIcon />
            </IconButton>
            <Col as='span' className='ml-2 px-0'>
              {numOfSelectedMessages
                ? `${numOfSelectedMessages} selected`
                : 'Cleared'}
            </Col>
          </Box>
          <Box className='d-flex'>
            <Box
              className={`chat-action-wrapper ${
                canShowReplyButton ? 'scale-up' : 'scale-down'
              }-forwards text-right`}>
              <IconButton
                className='reply-button mr-1'
                onClick={handleReplyMessage}
                aria-label='reply message'
                tabIndex={canShowReplyButton ? 0 : -1}
                aria-hidden={!canShowReplyButton}>
                <ReplyRoundedIcon />
              </IconButton>
            </Box>
            <Box className='chat-action-wrapper text-right'>
              <IconButton
                className='copy-button mr-1'
                onClick={handleCopyMessage}
                aria-label='copy message'>
                <FilterNoneRoundedIcon />
              </IconButton>
            </Box>
            <Box className='chat-action-wrapper text-right'>
              <IconButton
                className='delete-button mr-2'
                onClick={handleDeleteMessage}
                aria-label='delete message'>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </Row>
      </Container>

      <Memoize
        memoizedComponent={ConfirmDialog}
        open={openConfirmDialog}
        action={dialogAction}
        numOfSelectedMessages={numOfSelectedMessages}
        canDeleteForEveryone={canDeleteForEveryone}
      />
    </>
  );
}

export default MiddlePaneHeader;
