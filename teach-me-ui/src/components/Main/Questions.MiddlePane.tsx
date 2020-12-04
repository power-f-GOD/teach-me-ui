import React from 'react';

import Row from 'react-bootstrap/Row';

import Container from '@material-ui/core/Container';

import Question from '../crumbs/Question';

const mockQuestions: Array<Object> = [
  {
    date: '5 minutes ago',
    answered: true,
    views: '3k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body: "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    },
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },{
    date: '5 minutes ago',
    answered: false,
    views: '1k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body: "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    },
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },{
    date: '5 minutes ago',
    answered: true,
    views: '3k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body: "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    },
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },{
    date: '5 minutes ago',
    answered: false,
    views: '1k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body: "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    },
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },{
    date: '5 minutes ago',
    answered: true,
    views: '3k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body: "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    },
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },{
    date: '5 minutes ago',
    answered: false,
    views: '1k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body: "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    },
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },{
    date: '5 minutes ago',
    answered: true,
    views: '3k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body: "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    },
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  },{
    date: '5 minutes ago',
    answered: false,
    views: '1k',
    answers: 2,
    votes: 45,
    body: {
      title: 'How do i create a neural network',
      body: "<span> Please i've been trying to create a neural network, i've tried doing one million iterations with my dataset but the algorithm gotten at the end doesnt get any better</span>",
      tags: ['Machine-Mearning', 'Python', 'Tensorflow']
    },
    // userDetails: {
    //   displayName: 'Anyaoha Prince',
    //   bio: 'software Engineer at Kanyimuta',
    //   avatar: null
    // }
  }
];


const MiddlePane = (props: any) => {

  return (
    <Container className='questions px-0'>
      <Row className='d-flex mx-auto mt-0'>
        <Container component='div' className='d-flex ask-container mt-0'>
          <h1 className='mt-2 mb-2 py-2'>Questions</h1>
        </Container>
      </Row>
      {/* <hr id='divider'/> */}
      <Container component='div' className='mt-3 p-0'>
        {mockQuestions.map((question, i) => <Question question={question} key={i}/>)}
      </Container>
    </Container>
  )
}

export default MiddlePane;