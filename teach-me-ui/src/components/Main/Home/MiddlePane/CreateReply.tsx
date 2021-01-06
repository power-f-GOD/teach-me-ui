import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  FormEvent
} from 'react';

import { connect } from 'react-redux';

import {
  delay,
  replyToPostFn,
  getCharacterSequenceFromText
  // preventEnterNewLine
} from '../../../../functions';

import { Reply, UserData } from '../../../../constants/interfaces';

import Row from 'react-bootstrap/Row';

import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';

import { pingUser } from '../../../../actions';

interface CreateReplyProps {
  post_id: string;
  className: string;
  replyToPost?: Function;
  userData?: UserData;
}

const CreateReply: React.FC<CreateReplyProps> = (props) => {
  const { post_id, className, userData } = props;
  const { displayName, profile_photo } = userData || {};
  const isOpen = /open/.test(className);
  const openTriggeredByButton = /triggered.*button/.test(className);

  const inputRef = useRef<HTMLInputElement | any>(null);
  const commentFormRef = useRef<HTMLInputElement | any>(null);
  const commentContainerRef = useRef<HTMLInputElement | any>(null);

  const [state, setState] = useState<{ reply: Reply }>({
    reply: {
      text: '',
      mentions: [],
      hashtags: [],
      media: []
    }
  });

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const reply = (e.target as HTMLTextAreaElement)?.value;
    setState({
      ...state,
      reply: {
        text: reply,
        mentions: getCharacterSequenceFromText(reply, '@'),
        hashtags: getCharacterSequenceFromText(reply, '#'),
        media: []
      }
    });
  };

  const submitReply = (e: FormEvent) => {
    e.preventDefault();
    state.reply.text &&
      replyToPostFn(post_id!, state.reply).then(() => {
        state.reply.mentions.length && pingUser(state.reply.mentions);
      });
    inputRef!.current!.value = '';
    setState({
      ...state,
      reply: {
        mentions: [],
        hashtags: [],
        text: '',
        media: []
      }
    });
  };

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

      if (isOpen && openTriggeredByButton) {
        delay(300).then(() => input.focus());
      } else {
        input.blur();
      }
    }
  }, [isOpen, openTriggeredByButton]);

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
          placeholder='Write a reply...'
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
          disabled={!state.reply.text.trim() || !isOpen}
          className='comment-button btn-secondary contained'>
          Reply
        </Button>
      </Row>
    </form>
  );
};

const mapStateToProps = ({ userData }: any) => ({
  userData
});

export default connect(mapStateToProps)(CreateReply);
