import React, { useEffect } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import RightPane from './Home.RightPane';
import MiddlePane from './Home.MiddlePane';
import LeftPane from './Home.LeftPane';

import { connect } from 'react-redux';
import { getPosts } from '../../actions/posts';
import { dispatch, createObserver } from '../../functions/utils';
import { PostPropsState, FetchState } from '../../constants/interfaces';

const observedElementRef = React.createRef<any>();

//used/observed to load/fetch more posts when it is intersecting via the IntersectionObserver
let observedElement: HTMLElement | null = null;

let observer: IntersectionObserver;

const Home = ({ posts }: { posts: FetchState<PostPropsState> }) => {
  useEffect(() => {
    document.body.style.overflow =
      posts.status === 'pending' ? 'hidden' : 'auto';
  }, [posts.status]);

  useEffect(() => {
    const isFetching = /fetching/.test(posts.statusText || '');
    observedElement = observedElementRef.current;

    if (observedElement) {
      observer = createObserver(
        null,
        (entries) => {
          const entry = entries[0];

          if (entry.isIntersecting && !isFetching && navigator.onLine) {
            dispatch(
              getPosts(
                'FEED',
                undefined,
                true,
                'is fetching more posts',
                posts.extra
                  ? `/feed?recycle=true&offset=${posts.extra ?? ''}`
                  : undefined
              )
            );
          }
        },
        { threshold: [0.01] }
      );

      observer.observe(observedElement);
    }

    return () => {
      observer.unobserve(observedElement as Element);
      // window.scrollTo(0, 0);
    };
  }, [posts.statusText, posts.err, posts.extra]);

  return (
    <>
      <Container className='Home fade-in'>
        <Row className='mx-auto justify-content-around align-items-start pt-3'>
          <Col
            lg={3}
            md={4}
            className='d-none hang-in d-md-block left-pane-col'>
            <LeftPane />
          </Col>
          <Col lg={6} md={8} className='middle-pane-col px-3'>
            <MiddlePane type={'FEED'} />
            <Container
              className='feeds-scroll-observer py-2'
              ref={observedElementRef}></Container>
          </Col>
          <Col lg={3} className='d-none hang-in d-lg-block right-pane-col'>
            <RightPane />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default connect((state: any) => ({ posts: state._posts }))(Home);
