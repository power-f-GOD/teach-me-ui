import React from 'react';

import Row from 'react-bootstrap/Row';

import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import CheckIcon from '@material-ui/icons/Check';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

const Answer = ({ answer }: any) => {
  return (
    <Container className='p-0 m-0 mt-2 question-page'>
      <Row className='d-flex mx-auto mt-0'>
        <Container className='d-flex m-0 p-0'>
          <Container className='mx-auto mt-0 votes p-0 d-flex'>
            <Container className='d-flex m-0 p-0 icon cursor-pointer'>
              <ArrowDropUpIcon className='change-vote' fontSize='large'/>
            </Container>
            <Container component='h1' className='m-0 p-0'>
              {answer.votes}
            </Container>
            <Container className='d-flex m-0 p-0 icon cursor-pointer'>
              <ArrowDropDownIcon className='change-vote' fontSize='large'/>
            </Container>
            {answer.accepted && (
              <Container className='d-flex m-0 p-0 icon cursor-pointer'>
                <CheckIcon className='check' fontSize='large'/>
              </Container>
            )}
          </Container>
          <Container className='mt-0 pl-0'>
            <div
              className='mt-2'
              dangerouslySetInnerHTML={{
                __html: answer.answer
              }}>
            </div>
            <Container className='p-0 m-0'>
              <Container component='div' className='pb-2 px-0 mt-2 user-details'>
                <Container component='div' className='pb-2 px-0 mt-2 d-flex user-details'>
                  <Avatar/>
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
                      {answer.date}
                    </Container>
                  </Container>
                </Container>
              </Container>
            </Container>
          </Container>
        </Container>
      </Row>
    </Container>
  )
}
  

export default Answer;