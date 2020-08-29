import React, { 
  useState, 
  useRef, 
  ChangeEvent, 
  MouseEvent 
} from 'react';

import { recursiveUploadReturnsArrayOfId } from '../../../../functions/utils';

import { connect } from 'react-redux';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
// import Input from '@material-ui/core/Input'

import AttachmentIcon from '@material-ui/icons/Attachment';


import Row from 'react-bootstrap/Row';

import { 
  displayModal, 
  getMentionsFromText, 
  getHashtagsFromText 
} from '../../../../functions';

import { 
  // useStyles, 
  PostEditorState 
} from '../../../../constants';


import { 
  useSubmitPost
  /*useGetFormattedMentionsWithKeyword*/
} from '../../../../hooks/api';

let userInfo: any = {};
let [avatar, displayName, username] = ['', '', ''];

//you can now use the 'userData' props in state to get userInfo; for this component, you can mapToProps or better still, just pass the value you need to it as props from its parent
if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  displayName = userInfo.displayName;
  username = userInfo.username;
}

const CreatePost = (props: any) => {

  // const { sendFile } = props;

  const label = useRef<HTMLLabelElement | any>()

  // const avatarSizes = useStyles()
  const [state, setState] = useState<PostEditorState>({
    mentionsKeyword: '',
    post: {
      text: '',
      mentions: [],
      hashtags: [],
      media: []
    },
    top: 0,
    left: 0,
    showSuggestor: false,
    mentions: [],
    selectedFiles: []

  })
  // const getMentions = useGetFormattedMentionsWithKeyword(state.mentionsKeyword)[0];
  const [submitPost, , isSubmitting] = useSubmitPost(state.post);

  const editor = useRef<HTMLTextAreaElement | any>()

  const fileSelectedHandler = (e: ChangeEvent<any>) => {
    let files: Array<File> = [];
    for (let file of e.target.files) {
      if (file.size > 50000000) {
        label.current.style.display = 'block'
        return
      files.push(file)
      }
    }
    setState({
      ...state,
      selectedFiles: e.target.files,
      post: {
       ...state.post,
       media: recursiveUploadReturnsArrayOfId(files)
      }
    })
};

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const post = e.target.value;
    setState({
      ...state,
      post: { 
        ...state.post,
        text: post, 
        mentions: getMentionsFromText(post), 
        hashtags: getHashtagsFromText(post),
      }
    });
  }
  

  const onPostSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    if (state.post.text) {
      submitPost().then((data: any) => {
        if (!isSubmitting) {
          displayModal(false);
        }
      });
    }
  };
      
  return (
    <Box p={1} pt={0}>
      <Row className='container-fluid p-0 mx-auto'>
        <Avatar
          component='span'
          className='chat-avatar compose-avatar'
          alt={displayName}
          src={`/images/${avatar}`}
        />
        <div className='d-flex flex-column justify-content-center flex-grow-1'>
          <span>{displayName}</span>
          <small>{username}</small>
        </div>
      </Row>
      <form>
      {/* <div
        id='suggestion-container'
      > */}
       
          <textarea
            style={{whiteSpace: 'pre'}}
            onInput={onChange}
            autoFocus
            rows={9}
            id="post-input" 
            onChange={(e: any) => {
              onChange(e)
            }}
            placeholder={`What's on your mind, ${displayName.split(' ')[0]}`}
            ref={editor}
          />
          {/* <div> */}
            <label htmlFor='my-input'><AttachmentIcon/></label>
            <label htmlFor='my-input' ref={label} style={{color: 'red', fontSize: 'small', display: 'none'}} >files should be maximum of 50mb</label>
          <input
              multiple={true}
              id={'my-input'}
              style={{display:'none'}}
              type={'file'}
              // onChange={(e) => {fileSelectedHandler(e)}}
              // ref={myInput}
          />
        {/* <div
          id="suggestor-dropdown"
          style={{
            display: state.showSuggestor ? "block" : "none",
            top: state.top || 0,
            left: state.left || 0,
          }}
        >
          {
            state.mentions?.map((mention: any, key: number) => (
              <div
                key={key}
                style={{
                  padding: '10px 20px'
                }}  
              >
                <Avatar
                  className={avatarSizes.small}
                  component='span'
                  src={`${mention.avatar}`}
                />
                { mention.name }
              </div>
            ))  
          }
        </div>
      </div> */}
        <Row className='d-flex mx-auto mt-1'>
          <Button
            onClick={onPostSubmit}
            color={state.post.text
              ? 'primary' 
              : 'default'
            }
            className='post-button p-0 flex-grow-1'>
            {
              isSubmitting 
              ? <CircularProgress size={28} color='inherit'/> 
              : 'Post'
            }
          </Button>
        </Row>
      </form>
    </Box>
  );
};


const mapStateToProps = ({ sendFile }: any) => ({ sendFile });

export default connect(mapStateToProps)(CreatePost);