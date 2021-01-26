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
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

import { APIMessageResponse, Partial, FetchState } from '../../../../types';
import { userDeviceIsMobile } from '../../../..';
import { getConversationMessages } from '../../../../actions/main/chat';
import { dispatch, interval } from '../../../../utils';
import {
  Message,
  ChatDate,
  SelectedMessageValue,
  NewMessageBar
} from '../crumbs';
import { ChatMiddlePaneProps, messagesStatusInfo } from '.';
import { Memoize } from '..';

export const ScrollViewContext = createContext(
  {} as Partial<ChatMiddlePaneProps>
);

export const scrollViewRef: any = createRef<HTMLElement | null>();

export let scrollView: HTMLElement | null = null;

let hideScrollBarTimeout: any;
let loadMessagesTimeout: any;
let scrollViewPrevScrollPos = 0;

export const stickyChatDateRef: any = createRef<HTMLInputElement | null>();
let newMessageCount = 0;

export const ScrollView = (props: {
  userId: string;
  username: string;
  convoMessages: APIMessageResponse[];
  convoMessagesStatus: FetchState<APIMessageResponse>['status'];
  convoFriendship: string;
  convoUsername: string;
  convoId: string;
  convoDisplayName: string;
  clearSelections: boolean;
  selectedMessages: { [id: string]: SelectedMessageValue };
  setClearSelections: Function;
  setSelectedMessages: Function;
  handleProfileLinkClick: React.MouseEventHandler;
}) => {
  const {
    userId,
    username,
    convoMessages,
    convoMessagesStatus,
    convoFriendship,
    convoUsername,
    convoId,
    convoDisplayName,
    clearSelections,
    selectedMessages,
    setClearSelections,
    setSelectedMessages,
    handleProfileLinkClick
  } = props;
  const {
    convoMessagesErr,
    convoMessagesStatusText,
    convoParticipants,
    convoNewMessage,
    convoUnreadCount,
    convoLastReadDate
  } = useContext(ScrollViewContext);

  const [hasReachedTopOfConvo, setHasReachedTopOfConvo] = useState(false);

  const offset = (convoMessages![0] ?? {}).date;
  const handleScrollViewScroll = useCallback(() => {
    if (scrollView && convoId) {
      clearTimeout(loadMessagesTimeout);

      loadMessagesTimeout = setTimeout(() => {
        if (!(scrollView = scrollViewRef.current)) return;

        scrollViewPrevScrollPos =
          scrollView.scrollHeight - scrollView!.scrollTop;

        if (
          scrollView.scrollTop <= 200 &&
          !/end/.test(convoMessagesStatusText as string) &&
          scrollView.querySelector('.chat-msg-container')
        ) {
          dispatch(
            getConversationMessages(
              convoId as string,
              'settled',
              'has offset',
              offset
            )(dispatch)
          );
          setHasReachedTopOfConvo(false);
        }
      }, 350);

      if (!userDeviceIsMobile) {
        scrollView.classList.remove('scroll-ended');
        clearTimeout(hideScrollBarTimeout);
        hideScrollBarTimeout = setTimeout(() => {
          if (scrollView) {
            scrollView!.classList.add('scroll-ended');
          }
        }, 400);
      }
    }
  }, [convoId, offset, convoMessagesStatusText]);

  const handleMessageSelection = useCallback(
    (id: string | null, value: SelectedMessageValue) => {
      setClearSelections(false);
      setSelectedMessages((prev: { [id: string]: SelectedMessageValue }) => {
        const newState: { [key: string]: SelectedMessageValue } = {
          ...prev,
          ...{ [value.id]: value }
        };

        if (!id) {
          delete newState[value.id];
        }

        return newState;
      });
    },
    [setSelectedMessages, setClearSelections]
  );

  useEffect(() => {
    if (convoId) {
      setHasReachedTopOfConvo(false);
      newMessageCount = 0;
    }
  }, [convoId]);

  useEffect(() => {
    if (!scrollView) {
      scrollView = scrollViewRef.current;
    }

    if (scrollView) {
      scrollView.style.marginBottom = 'calc(21.5px - 1.25rem)';
    }

    return () => {
      newMessageCount = 0;
      scrollViewPrevScrollPos = 0;
      scrollView = null;
    };
  }, []);

  useEffect(() => {
    //call this on app load to take care of wider screens where messages may not be long enough for a scroll
    if (
      scrollView &&
      scrollView.scrollHeight <= scrollView.offsetHeight &&
      convoMessagesStatus === 'fulfilled' &&
      !/end|socket/.test(convoMessagesStatusText as string)
    ) {
      handleScrollViewScroll();
    }

    if (/end/.test(convoMessagesStatusText as string)) {
      setHasReachedTopOfConvo(true);
    }
  }, [convoMessagesStatus, convoMessagesStatusText, handleScrollViewScroll]);

  useEffect(() => {
    if (scrollView) {
      const canAdjustScrollTop =
        scrollView.scrollTop + scrollView.offsetHeight + 50 >=
        scrollView.scrollHeight - 300;
      const canAddScrollPadding =
        scrollView.scrollHeight > scrollView.offsetHeight;
      const scrollViewNewSrollPos =
        scrollView.scrollHeight - scrollViewPrevScrollPos;

      if (
        !convoMessagesStatusText ||
        /new/i.test(convoMessagesStatusText as string)
      ) {
        scrollView!.scrollTop += scrollView!.scrollHeight + 100;
      } else {
        //the code block below implies that if the request for or receipt of (a) new message(s) is not coming from a socket or message hasn't gotten to the very first message of the conversation and the receipt is coming from a request for previous messages (offset) in the conversation, scroll scrollView to the initial scroll position before messages were loaded.
        if (
          /offset/.test(convoMessagesStatusText as string) &&
          convoMessagesStatus === 'fulfilled' &&
          !/end|socket|new/.test(convoMessagesStatusText as string)
        ) {
          scrollView.scrollTop = scrollViewNewSrollPos;
        }
      }

      if (!userDeviceIsMobile) {
        if (canAddScrollPadding) {
          scrollView.classList.add('add-scroll-padding');
        } else {
          scrollView.classList.remove('add-scroll-padding');
        }
      }

      if (/settled|fulfilled/.test(convoMessagesStatus as string)) {
        if (convoMessages?.length) {
          (messagesStatusInfo ?? ({} as any)).inert = true;
          scrollView!.classList.remove('show-status-signal');
        } else {
          (messagesStatusInfo ?? ({} as any)).inert = false;
          scrollView.classList.add('show-status-signal');
        }
      }

      if (convoMessages && canAdjustScrollTop) {
        // animate (to prevent flicker) if scrollView is at very top else don't animate
        if (
          scrollView.scrollTop < scrollView.scrollHeight - 300 &&
          scrollView.scrollTop > 100
        ) {
          interval(
            () => {
              scrollView!.scrollTop += 100;
            },
            8,
            () =>
              scrollView!.scrollTop >=
              scrollView!.scrollHeight - scrollView!.offsetHeight - 50
          );
        }
      }
    }
  }, [convoMessages, convoMessagesStatus, convoMessagesStatusText]);

  newMessageCount = +convoUnreadCount!;

  return (
    <Col
      ref={scrollViewRef}
      as='section'
      className={`chat-scroll-view custom-scroll-bar grey-scrollbar`}
      onScroll={handleScrollViewScroll}>
      {!userDeviceIsMobile && (
        <Box
          id='chat-date-sticky'
          className={`chat-date-wrapper text-center ${
            convoMessages.length ? 'show' : 'hide'
          }`}>
          <Container
            as='span'
            className='chat-date d-inline-block w-auto'
            ref={stickyChatDateRef}></Container>
        </Box>
      )}

      <Box
        className={`more-messages-loader theme-tertiary-darker mt-auto ${
          convoMessagesStatus === 'settled' &&
          /offset/.test(convoMessagesStatusText as string) &&
          !convoMessagesErr
            ? ''
            : 'hide'
        }`}
        textAlign='center'>
        <CircularProgress thickness={4} color='inherit' size={28} />
      </Box>
      <Memoize
        memoizedComponent={NewMessageBar}
        type='sticky'
        convoUnreadCount={+convoUnreadCount!}
        scrollView={scrollView as HTMLElement}
        shouldRender={
          !!convoUnreadCount &&
          convoUnreadCount !== convoMessages.length &&
          convoMessages.length >= 20
        }
        className={convoId && convoUnreadCount ? '' : 'd-none'}
      />

      <Box
        className={`the-beginning text-center theme-tertiary ${
          convoMessagesStatus === 'fulfilled' && hasReachedTopOfConvo
            ? 'd-block'
            : 'd-none'
        }`}
        fontSize='0.85rem'>
        This is the beginning of your conversation with <br />
        <b className='font-bold'>{convoDisplayName ?? 'your colleague'}</b>.
      </Box>

      {convoMessages?.map((message, key: number) => {
        const {
          sender_id,
          date,
          delivered_to,
          deleted,
          seen_by,
          id: _id,
          timestamp_id,
          parent: head
        } = message;
        const type =
          sender_id && sender_id !== userId ? 'incoming' : 'outgoing';
        const [prevMessage, nextMessage] = [
          convoMessages![key - 1],
          convoMessages![key + 1]
        ];

        const lastRead = +convoLastReadDate!;
        const willRenderNewMessageBar =
          date > lastRead &&
          ((prevMessage?.date <= lastRead &&
            !!convoUnreadCount &&
            prevMessage?.date) ||
            (!!convoUnreadCount &&
              key === 0 &&
              convoUnreadCount === convoMessages.length));

        const prevDate = new Date(Number(prevMessage?.date)).toDateString();
        const nextDate = new Date(Number(nextMessage?.date)).toDateString();
        const selfDate = new Date(Number(date)).toDateString();

        const prevAndSelfSentSameDay = prevDate === selfDate;
        const nextAndSelfSentSameDay = nextDate === selfDate;
        const prevDelayed = date! - (prevMessage?.date ?? date!) >= 18e5;
        const nextDelayed = (nextMessage?.date ?? date!) - date! >= 18e5;

        const prevSenderId = (prevMessage ?? {}).sender_id;
        const nextSenderId = (nextMessage ?? {}).sender_id;

        const isFirstOfStack =
          prevSenderId !== sender_id || !prevAndSelfSentSameDay;
        const isOnlyOfStack =
          (prevSenderId !== sender_id && nextSenderId !== sender_id) ||
          (!nextAndSelfSentSameDay && !prevAndSelfSentSameDay);
        const isMiddleOfStack =
          prevSenderId === sender_id &&
          nextSenderId === sender_id &&
          nextAndSelfSentSameDay &&
          prevAndSelfSentSameDay;
        const isLastOfStack =
          nextSenderId !== sender_id || !nextAndSelfSentSameDay || nextDelayed;

        const shouldRenderDate =
          !prevAndSelfSentSameDay && convoUnreadCount !== convoMessages.length;
        const className = `${prevDelayed ? 'delayed mt-3' : ''} ${
          isFirstOfStack ? 'first' : ''
        } ${isOnlyOfStack ? 'only' : ''} ${isLastOfStack ? 'last' : ''} ${
          isMiddleOfStack ? 'middle' : ''
        } ${convoNewMessage?.id === _id || timestamp_id ? '' : ''}`;

        if (willRenderNewMessageBar) {
          newMessageCount = 0;
          newMessageCount = convoMessages
            .slice(key)
            .reduce((a, b) => (b.sender_id !== userId ? a + 1 : a), 0);
        }

        return (
          <React.Fragment key={key}>
            {shouldRenderDate && (
              <Memoize
                memoizedComponent={ChatDate}
                scrollView={scrollView as HTMLElement}
                timestamp={Number(date)}
              />
            )}
            <Memoize
              memoizedComponent={NewMessageBar}
              type='relative'
              convoUnreadCount={+newMessageCount}
              scrollView={scrollView as HTMLElement}
              shouldRender={willRenderNewMessageBar}
            />
            <Memoize
              memoizedComponent={Message}
              message={message as APIMessageResponse}
              type={type}
              sender_username={type === 'incoming' ? convoUsername : username}
              headSenderUsername={
                head?.sender_id === userId ? username : convoUsername
              }
              clearSelections={
                _id! in selectedMessages && clearSelections ? true : false
              }
              forceUpdate={
                String(deleted) + delivered_to?.length + seen_by?.length
              }
              className={className}
              userId={userId}
              participants={convoParticipants}
              scrollView={scrollView as HTMLElement}
              canSelectByClick={!!Object.keys(selectedMessages)[0]}
              handleMessageSelection={handleMessageSelection}
            />
          </React.Fragment>
        );
      })}
      {!convoFriendship && convoId && (
        <Box className='text-center py-5 px-3 my-2'>
          You are not colleagues with{' '}
          <Box fontWeight='bold'>{convoDisplayName}.</Box>
          <br />
          Send{' '}
          <Link
            className='font-bold'
            onClick={handleProfileLinkClick}
            to={`/@${convoUsername}${window.location.search.replace(
              'o1',
              'm2'
            )}`}>
            {convoDisplayName?.split(' ')[0]}
          </Link>{' '}
          a colleague request to continue your conversation.
        </Box>
      )}
    </Col>
  );
};
