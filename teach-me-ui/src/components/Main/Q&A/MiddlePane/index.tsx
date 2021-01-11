import React, { useState, useRef } from 'react';

import Row from 'react-bootstrap/Row';

import Container from '@material-ui/core/Container';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';

import Question from '../crumbs/Question';
import { CREATE_QUESTION } from '../../../../constants';
import { displayModal } from '../../../../functions';

const mockQuestions: Array<Object> = [
  {
    date: '5 minutes ago',
    answered: true,
    views: '3k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body:
        "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    }
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },
  {
    date: '5 minutes ago',
    answered: false,
    views: '1k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body:
        "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    }
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },
  {
    date: '5 minutes ago',
    answered: true,
    views: '3k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body:
        "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    }
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },
  {
    date: '5 minutes ago',
    answered: false,
    views: '1k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body:
        "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    }
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },
  {
    date: '5 minutes ago',
    answered: true,
    views: '3k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body:
        "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    }
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },
  {
    date: '5 minutes ago',
    answered: false,
    views: '1k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body:
        "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    }
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },
  {
    date: '5 minutes ago',
    answered: true,
    views: '3k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body:
        "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    }
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },
  {
    date: '5 minutes ago',
    answered: false,
    views: '1k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body:
        "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    }
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  }
];

const MiddlePane = (props: any) => {
  const [showSearch, setShowSearch] = useState(false);
  const inputRef = useRef<any>();

  const openQuestionModal = (e: any) => {
    displayModal(true, false, CREATE_QUESTION, { title: 'Ask A Question' });
  };

  const showSearchFn = (e: any) => {
    setShowSearch(true);
  };

  const hideSearchFn = (e: any) => {
    setShowSearch(false);
  };

  return (
    <Container className='questions px-0'>
      <Row className='d-flex mx-auto mt-0'>
        <Container component='div' className='d-flex ask-container mb-1'>
          <h1 className={`${showSearch ? 'd-none' : ''} mt-2 mb-2 py-2`}>
            Questions
          </h1>
          {!showSearch ? (
            <SearchIcon onClick={showSearchFn} className='question-search' />
          ) : (
            <CloseIcon onClick={hideSearchFn} className='close pr-0 mr-0' />
          )}
          <input
            autoFocus
            ref={inputRef}
            type='text'
            placeholder='Search for questions'
            className={`${showSearch ? '' : 'd-none'} input`}
          />
          <Button
            onClick={openQuestionModal}
            className={`${showSearch ? 'd-none' : ''} question-ask-mobile`}
            color='primary'
            size='medium'
            variant='contained'>
            Ask Question
          </Button>
        </Container>
      </Row>
      {/* <hr id='divider'/> */}
      <Container component='div' className='mt-3 p-0'>
        {mockQuestions.map((question, i) => (
          <Question question={question} key={i} />
        ))}
      </Container>
    </Container>
  );
};

export default MiddlePane;
