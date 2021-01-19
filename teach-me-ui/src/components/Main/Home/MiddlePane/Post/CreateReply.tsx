import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  useCallback,
  FormEvent
} from 'react';
import { connect } from 'react-redux';

import Row from 'react-bootstrap/Row';
import { Button, Avatar } from '@material-ui/core';
import { TextField } from '@material-ui/core';

import { UserData } from '../../../../../types';

import {
  delay,
  getCharacterSequenceFromText,
  emitUserOnlineStatus
} from '../../../../../functions';
import { pingUser } from '../../../../../actions';

interface CreateReplyProps {
  post_id: string;
  className: string;
  replyToPost?: Function;
  userData?: UserData;
  webSocket?: WebSocket;
  setOpenCommentClassName: Function;
}

const CreateReply = (props: CreateReplyProps) => {
  const {
    post_id,
    className,
    userData,
    webSocket: socket,
    setOpenCommentClassName
  } = props;
  const { displayName, profile_photo } = userData || {};
  const isOpen = /open/.test(className);
  const openTriggeredByButton = /triggered.*button/.test(className);

  const inputRef = useRef<HTMLInputElement | any>(null);
  const commentFormRef = useRef<HTMLInputElement | any>(null);
  const commentContainerRef = useRef<HTMLInputElement | any>(null);

  const [text, setText] = useState<string>('');
  const [resetHeight, setResetHeight] = useState<boolean>(false);

  const onChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = (e.target as HTMLTextAreaElement)?.value;

    setText(text.trim());
  }, []);

  const submitReply = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      if (!text) return;

      const online = navigator.onLine;
      const mentions = getCharacterSequenceFromText(text, '@');
      const payload = {
        text,
        mentions,
        hashtags: getCharacterSequenceFromText(text, '#'),
        pipe: 'POST_REPLY',
        post_id
      };

      if (socket && socket.readyState === socket.OPEN && online) {
        socket?.send(JSON.stringify({ ...payload }));
        inputRef!.current!.value = '';
        setText('');
        setResetHeight(true);
        setOpenCommentClassName('open');
        delay(50).then(() => setResetHeight(false));

        if (mentions?.length) pingUser(mentions);
      } else {
        emitUserOnlineStatus(online, !online, {
          open: true,
          message: online
            ? "Something went wrong. Seems you are/were offline. We'll try to reconnect then you can try again."
            : null,
          severity: 'info',
          autoHide: false
        });
      }
    },
    [text, post_id, socket, setOpenCommentClassName]
  );

  useEffect(() => {
    const commentForm = commentFormRef.current as HTMLElement;
    const commentContainer = commentContainerRef.current as HTMLElement;
    const input = inputRef.current as HTMLInputElement;

    if (commentContainer) {
      let refHeight = `${commentContainer.offsetHeight}px`;

      commentForm.style.height = isOpen ? refHeight : '0';

      input.onfocus = () => {
        if (isOpen) {
          commentForm.style.height = 'auto';
        }
      };

      input.onblur = () => {
        refHeight = `${commentContainer.offsetHeight}px`;

        if (isOpen) {
          commentForm.style.height = refHeight;
        }
      };

      if (isOpen && openTriggeredByButton && !resetHeight) {
        delay(300).then(() => input.focus());
      } else {
        input.blur();
      }
    }
  }, [isOpen, openTriggeredByButton, resetHeight]);

  return (
    <form
      onSubmit={submitReply}
      className={`Comment ${className}`}
      ref={commentFormRef}>
      <Row className='comment-container' ref={commentContainerRef}>
        <Avatar
          className='comment-avatar'
          component='span'
          alt={displayName}
          src={profile_photo ?? ''}
        />
        <TextField
          onChange={onChange}
          className='comment-field'
          placeholder='Say something...'
          multiline
          rows={1}
          rowsMax={6}
          variant='outlined'
          size='small'
          fullWidth
          inputRef={inputRef}
          inputProps={{
            className: 'small-bar tertiary-bar rounded-bar',
            disabled: !isOpen
          }}
        />
        <Button
          variant='contained'
          onClick={submitReply}
          disabled={!text || !isOpen}
          className='comment-button btn-secondary contained'>
          Reply
        </Button>
      </Row>
    </form>
  );
};

export default connect(
  ({ userData, webSocket }: { userData: UserData; webSocket: WebSocket }) => ({
    userData,
    webSocket
  })
)(CreateReply);
