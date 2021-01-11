import React, { useEffect } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import HomeRightPane from './RightPane';
import HomeMiddlePane from './MiddlePane';
import HomeLeftPane from './LeftPane';

import { connect } from 'react-redux';
import { getPosts, posts } from '../../../actions/main/home';
import { dispatch, createObserver } from '../../../functions/utils';
import { PostStateProps, FetchState } from '../../../constants/interfaces';

const observedElementRef = React.createRef<any>();

//used/observed to load/fetch more posts when it is intersecting via the IntersectionObserver
let observedElement: HTMLElement | null = null;

let observer: IntersectionObserver;

const Home = ({ posts: _posts }: { posts: FetchState<PostStateProps> }) => {
  useEffect(() => {
    document.body.style.overflow =
      _posts.status === 'pending' ? 'hidden' : 'auto';
  }, [_posts.status]);

  useEffect(() => {
    observedElement = observedElementRef.current;

    return () => {
      dispatch(posts({ statusText: 'home unmounted' }));
    };
  }, []);

  useEffect(() => {
    const isFetching =
      /fetching/.test(_posts.statusText || '') || _posts.status === 'pending';
    const reachedEnd = /reached end/.test(_posts.statusText || '');

    if (observedElement) {
      observer = createObserver(
        null,
        (entries) => {
          const entry = entries[0];

          if (
            entry.isIntersecting &&
            !isFetching &&
            !reachedEnd &&
            navigator.onLine
          ) {
            dispatch(
              getPosts(
                'FEED',
                undefined,
                true,
                _posts.statusText
                  ? _posts.statusText
                  : 'is fetching more posts',
                _posts.extra
                  ? `/feed?recycle=true&offset=${_posts.extra ?? ''}`
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
      observer?.unobserve(observedElement as Element);
      // window.scrollTo(0, 0);
    };
  }, [_posts.statusText, _posts.err, _posts.status, _posts.extra]);

  return (
    <>
      <Container className='Home fade-in'>
        <Row className='mx-auto justify-content-around align-items-start pt-3'>
          <Col
            lg={3}
            md={4}
            className='d-none hang-in d-md-block left-pane-col'>
            <HomeLeftPane />
          </Col>
          <Col lg={6} md={8} className='middle-pane-col px-3'>
            <HomeMiddlePane type={'FEED'} />
            <Container
              className='feeds-scroll-observer py-2'
              ref={observedElementRef}></Container>
          </Col>
          <Col lg={3} className='d-none hang-in d-lg-block right-pane-col'>
            <HomeRightPane />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default connect((state: any) => ({ posts: state.posts }))(Home);
