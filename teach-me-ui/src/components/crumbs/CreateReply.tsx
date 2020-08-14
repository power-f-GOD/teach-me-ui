import React, 
{ 
  useState, 
  useRef,
  ChangeEvent,
  FormEvent
} from "react";

// import { connect } from 'react-redux';

import { 
  getState, 
  replyToPostFn, 
  getHashtagsFromText, 
  getMentionsFromText 
} from '../../functions';

import { UserData, Post} from '../../constants/interfaces';

import Row from 'react-bootstrap/Row';

// import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
// import CircularProgress from '@material-ui/core/CircularProgress';


const CreateReply: React.FC<any> = (props) => {
  const userData = getState().userData as UserData;

  const input = useRef<HTMLInputElement | any>('')

  const [state, setState] = useState<{ reply: Post }>({
    reply: {
      text:'',
      mentions: [],
      hashtags: []
    }
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const reply = (e.target as HTMLInputElement)?.value;
    setState({
      ...state,
      reply: {
        text: reply,
        mentions: getMentionsFromText(reply),
        hashtags: getHashtagsFromText(reply)
      }
    })
  }

  const submitReply = (e: FormEvent) => {
    e.preventDefault();
    state.reply.text && replyToPostFn(props.post_id, state.reply);
    input!.current!.value = '';

  }

  return (
    <form onSubmit={submitReply}>
      <Row className='container-fluid mx-auto align-items-center'>
        <Avatar
          className='comment-avatar'
          component='span'
          alt={userData.displayName}
          src={`/images/${userData.avatar}`}
        />
        <input
          ref={input}
          onChange={onChange}
          className='flex-grow-1 comment'
          placeholder='Write a comment'
        />
        {/* <Button
          onCLick
          className='comment-button'
          color={state.reply.text
            ? 'primary' 
            : 'default'
          }
        >
          {props.replyToPost.status === 'pending'
            ? <CircularProgress/>
            : 'Reply'
          }
        </Button> */}
      </Row>
    </form>
  )
};

// const mapStateToProps = ({ replyToPost }: any) => ({ replyToPost });

// export default connect(mapStateToProps)(CreateReply);

export default CreateReply;
