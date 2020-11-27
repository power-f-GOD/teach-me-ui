import React from 'react';

import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';

import { displayModal } from '../../functions';
import { CREATE_QUESTION } from '../../constants/modals';


const MiddlePane = (props: any) => {
  
  const openQuestionModal = (e: any) => {
    displayModal(true, false, CREATE_QUESTION, {title: 'Ask A Question'});
  }

  return (
    <Container className='questions'>
      <Button 
        onClick={openQuestionModal}
        className='question-ask'
        color='primary'
        variant='contained'>
        Ask Question
      </Button>
    </Container>
  )
}

export default MiddlePane;