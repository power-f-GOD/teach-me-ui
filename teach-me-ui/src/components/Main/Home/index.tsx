import React from 'react';

import { Route, Switch } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import HomeRightPane from './RightPane';
import HomeMiddlePane from './MiddlePane';
import HomeLeftPane from './LeftPane';

import { connect } from 'react-redux';
import { PostStateProps, FetchState } from '../../../types';
import PostPage from './PostPage';
import Search from '../Search';

interface HomeProps {
  posts: FetchState<PostStateProps>;
  webSocket: WebSocket;
}

const Home = (props: HomeProps) => {
  return (
    <Container className={`Home fade-in`}>
      <Row className='mx-auto justify-content-around align-items-start pt-3'>
        <Col lg={3} md={4} className='d-none hang-in d-md-block left-pane-col'>
          <HomeLeftPane />
        </Col>
        <Col lg={6} md={8} className='middle-pane-col px-3'>
          <Switch>
            <Route
              path={['/', '/index', '/home']}
              exact
              component={HomeMiddlePane}
            />
            <Route path='/p/:id' exact component={PostPage} />
            <Route path='/search' exact component={Search} />
          </Switch>
        </Col>
        <Col lg={3} className='d-none hang-in d-lg-block right-pane-col'>
          <HomeRightPane />
        </Col>
      </Row>
    </Container>
  );
};

export default connect((state: HomeProps) => ({
  posts: state.posts,
  webSocket: state.webSocket
}))(Home);
