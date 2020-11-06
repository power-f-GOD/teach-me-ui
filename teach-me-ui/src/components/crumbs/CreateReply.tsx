import React, 
{ 
  useState, 
  useRef,
  ChangeEvent,
  FormEvent
} from "react";

import { connect } from 'react-redux';

import { 
  getState, 
  replyToPostFn, 
  getCharacterSequenceFromText,
  // preventEnterNewLine
} from '../../functions';

import { 
  UserData, 
  Reply
} from '../../constants/interfaces';

import Row from 'react-bootstrap/Row';

import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';

import { pingUser } from "../../actions";


const CreateReply: React.FC<any> = (props) => {
  const userData = getState().userData as UserData;

  const input = useRef<HTMLInputElement | any>('')

  const [state, setState] = useState<{ reply: Reply }>({
    reply: {
      text:'',
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
    })
  }

  const submitReply = (e: FormEvent) => {
    e.preventDefault();
    state.reply.text && replyToPostFn(props.post_id, state.reply)
      .then(() => {
        state.reply.mentions.length && pingUser(state.reply.mentions)
      });
    input!.current!.value = '';
    setState({
      ...state,
      reply: {
        mentions: [],
        hashtags: [],
        text: '',
        media: []
      }
    })

  }

  return (
    <form onSubmit={submitReply}>
      <Row className='container-fluid mx-auto align-items-center comment-container'>
        <Avatar
          className='comment-avatar'
          component='span'
          alt={userData.displayName}
          src={userData.profile_photo ? userData.profile_photo : `images/${userData.avatar}`}
        />
        <TextField
            onChange={onChange}
            className='flex-grow-1 comment'
            placeholder='Write a comment'
            multiline
            rows={1}
            size='small'
            inputRef={input}
          />
        <Button
          // variant='contained'
          size='small'
          onClick={submitReply}
          className='comment-button'
          color={state.reply.text
            ? 'primary'
            : 'default'
          }
        >
          Reply
        </Button>
      </Row>
    </form>
  )
};

const mapStateToProps = ({ replyToPost }: any) => ({ replyToPost });

export default connect(mapStateToProps)(CreateReply);
