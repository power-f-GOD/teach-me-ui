import React from 'react';

import Row from 'react-bootstrap/Row';

import Container from '@material-ui/core/Container';

import Answer from '../crumbs/Answer';

import {
  displayModal
} from '../../../../functions';
import {
  CREATE_ANSWER
} from '../../../../constants';
import { KAvatar } from '../../../shared';

const MiddlePane = (props: any) => {
  const tags: string[] = ['Machine-Learning', 'Python', 'Tensorflow'];

  const openQuestionModal = (e: any) => {
    displayModal(true, false, CREATE_ANSWER, {title: 'Answer'});
  }

  const answers = [
    {
      accepted: true,
      votes: 786,
      answer: 'You need to check your algorithm, dataset and also its quantity properly, i would like to see your code so that we will know what is doing you, hope your gpu is good',
      date: '4 minutes ago'
    },{
      votes: 800,
      answer: 'You need to check your algorithm, dataset and also its quantity properly, i would like to see your code so that we will know what is doing you, hope your gpu is good',
      date: '3 minutes ago'
    },{
      votes: 900,
      answer: 'You need to check your algorithm, dataset and also its quantity properly, i would like to see your code so that we will know what is doing you, hope your gpu is good',
      date: '2 minutes ago'
    }
  ];

  return (
    <>
      <Container className='question-page mt-0'>
        <Row className='d-flex mx-auto mt-0'>
          <Container component='h1' className='p-0 title'>
            How do I Create A Neural Network?
          </Container>
        </Row>
        <Row className='d-flex mx-auto mt-0'>
          <Container className='d-flex p-0 rating'>
            <Container component='small' className='p-0'>
              <Container component='span' className='d-inline pl-0 pr-2 labels'>
                Asked
              </Container>
              5 minutes ago
            </Container>
            <Container component='small' className='p-0 pl-3'>
              <Container component='span' className='d-inline pl-0 pr-2 labels'>
                Active
              </Container>
              5 minutes ago
            </Container>
            <Container component='small' className='p-0 pl-3'>
              <Container component='span' className='d-inline pl-0 pr-2 labels'>
                Views
              </Container>
              3k
            </Container>
          </Container>
        </Row>
        <hr className='my-1 global-divider'/>
        <div
          className='mt-3'
          dangerouslySetInnerHTML={{
            __html: `<span> 
            Please i've been trying to create a neural network, 
            i've tried doing one million iterations with my dataset 
            but the algorithm gotten at the end doesnt get any better</span>`
          }}>
        </div>
        <Container component='div' className='px-0 tag-container mt-2'>
          {tags.map((tag: string, i: number) => (
            <span className='tag' key={i} >
              <a style={{color: 'inherit'}} href={`/questions/tagged/${tag}`}><small>{tag}</small></a>
            </span>
          ))}
        </Container>
        <Container className='d-flex p-0 m-0'>
          <small
            onClick={openQuestionModal}
            className='answer cursor-pointer'>
            Answer this question
          </small>
          <Container component='div' className='pb-2 px-0 mt-2 d-flex user-details'>
            <KAvatar/>
            <Container component='div' className='m-0 p-0'>
              <Container component='div' className='d-flex p-0'>
                <Container component='a' href='/@prince' className='pl-2 display-name'>
                  Anyaoha Prince
                </Container>
                <Container component='p' className='pl-0 username'>
                  @prince
                </Container>
              </Container>
              <Container component='small' className='pl-2 bio'>
                Software Enginner at Kanyimuta
              </Container>
            </Container>
          </Container>
        </Container>
      </Container>
      {answers.map((answer: Object, i: number) => <Answer answer={answer} key={i} />)}
    </>
  )
}

export default MiddlePane;