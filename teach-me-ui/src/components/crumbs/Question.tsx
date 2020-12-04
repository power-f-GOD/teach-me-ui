import React from 'react';

import { useHistory } from 'react-router-dom';

import Row from 'react-bootstrap/Row';

import Container from '@material-ui/core/Container';

const getText = (text: string) => {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent as string;
}

const Question = (props: any) => {
  const { question } = props;
  const history = useHistory();

  const navigate = (e: any) => {
    history.push('/question/1')
  }

  return (
    <Row className='d-flex mx-auto mt-2'>
      <Container className='d-flex question-container'>
        <Container component='div' className='px-0 d-flex rating-container-main'>
          <Container component='div' className='px-0 rating-container'>
            <Container component='p' className='p-0 m-0 rating-container'>
              {question.votes}
            </Container>
            <Container component='small' className='mb-2 px-0 rating-container labels'>
              votes
            </Container>
          </Container>
          <Container component='div' className={`px-0 rating-container ${question.answered ? 'answered' : 'not-answered'}`}>
            <Container component='div' className='px-0 rating-container'>
              {question.answers}
            </Container>
            <Container component='small' className={`px-0 rating-container ${question.answered ? '' : 'labels'}`}>
              answers
            </Container>
          </Container>
          <Container component='small' className='mt-1 px-0 rating-container'>
            {question.views}{' '}views
          </Container>
        </Container>
        <Container component='div' className='main-question px-1'>
          <Container component='h2' className='p-0 m-0'>
            <a className='question-title-link text-decoration-none' href='/question/1'>{ question.body.title }</a>
          </Container>
          <hr className='mt-2 mb-0 global-divider'/>
          <div
            onClick={navigate}
            className='pt-3 pb-3 cursor-pointer questions-body'
            dangerouslySetInnerHTML={{
              __html: `${getText(question.body.body).substring(0, 125)}...`
            }}>
          </div>
          <hr className='mb-1 mt-0 global-divider'/>
          <Container component='div' className='px-0 mt-2 d-flex'>
            <Container component='div' className='px-0 tag-container'>
              {question.body.tags.map((tag: string, i: number) => (
                <span className='tag' key={i} >
                  <a style={{color: 'inherit'}} href={`/questions/tagged/${tag}`}><small>{tag}</small></a>
                </span>
              ))}
            </Container>
            <Container component='div' className='user-details p-0'>
              <Container component='small' className='labels p-0'>
                {question.date}
              </Container>
            </Container>
          </Container>
        </Container>
      </Container>
    </Row>
  )
}

export default Question;