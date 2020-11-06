import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  FormEvent
} from 'react';

import { connect } from 'react-redux';

import {
  getState,
  replyToPostFn,
  getHashtagsFromText,
  getMentionsFromText,
  delay
  // preventEnterNewLine
} from '../../functions';

import { UserData, Reply } from '../../constants/interfaces';

import Row from 'react-bootstrap/Row';

import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';

import { pingUser } from '../../actions';

const CreateReply: React.FC<any> = (props) => {
  const { className } = props;
  const userData = getState().userData as UserData;
  const isOpen = className === 'open';

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
        mentions: getMentionsFromText(reply),
        hashtags: getHashtagsFromText(reply),
        media: []
      }
    });
  };

  const submitReply = (e: FormEvent) => {
    e.preventDefault();
    state.reply.text &&
      replyToPostFn(props.post_id, state.reply).then(() => {
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

      if (isOpen) {
        delay(300).then(() => input.focus());
      }
    }
  }, [isOpen]);

  return (
    <form
      onSubmit={submitReply}
      className={`Comment ${className}`}
      ref={commentFormRef}>
      <Row className='comment-container' ref={commentContainerRef}>
        <Avatar
          className='comment-avatar'
          component='span'
          alt={userData.displayName}
          src={
            userData.profile_photo
              ? userData.profile_photo
              : `images/${userData.avatar}`
          }
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

const mapStateToProps = ({ replyToPost }: any) => ({ replyToPost });

export default connect(mapStateToProps)(CreateReply);
