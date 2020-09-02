import React from 'react';

// import Box from '@material-ui/core/Box';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import RightPane from './Home.RightPane';
import MiddlePane from './Home.MiddlePane';
import LeftPane from './Home.LeftPane';

import { connect } from 'react-redux';
import { fetchPostsFn } from '../../functions';

const elementRef = React.createRef<any>();

const isBottom = (el: HTMLElement) =>
  el.getBoundingClientRect().bottom <= window.innerHeight;

const morePosts = () => {
  fetchPostsFn('FEED', undefined, true);
};

const trackScrolling = () => {
  if (isBottom(elementRef.current as HTMLElement)) {
    console.log('bottom reached');
    morePosts();
  }
};

const Home = (props: any) => {
  React.useEffect(() => () => window.scrollTo(0, 0), []);
  React.useEffect(() => {
    document.addEventListener('scroll', trackScrolling);
    return () => {
      document.removeEventListener('scroll', trackScrolling);
    };
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <Container className='Home p-0 fade-in'>
        <Row
          ref={elementRef}
          className='container mx-auto justify-content-around'
          style={{ alignItems: 'flex-start' }}>
          <Col
            lg={3}
            md={4}
            className='d-none hang-in d-md-block left-pane-col'>
            <LeftPane />
          </Col>
          <Col lg={6} md={8} className='middle-pane-col'>
            <MiddlePane type={'FEED'} />
          </Col>
          <Col lg={3} className='d-none hang-in d-lg-block right-pane-col'>
            <RightPane />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default connect(({ posts }: any) => ({ posts }))(Home);
