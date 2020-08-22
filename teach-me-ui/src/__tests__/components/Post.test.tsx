// import dependencies
import React from 'react';

// import react-testing methods
import { render, fireEvent, waitFor, screen } from '@testing-library/react';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom/extend-expect';

import Post from '../../components/crumbs/Post';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import { PostPropsState } from '../../constants';

const post: PostPropsState = {
  sender_id: '1',
  id: '1',
  posted_at: 123456,
  reposts: 1,
  sender_name: 'Benjamin Chibuzor-Orie',
  downvotes: 2450,
  upvotes: 7134561,
  replies: 45271,
  sender_username: 'iambenkay',
  text:
    'Where do people go when they die? Same place they were before they were born!',
  userAvatar: 'avatar-2.png',
  reaction: 'DOWNVOTE'
};

test('loads and displays placeholder text', async () => {
  const PostSample = () => (
    <>
      <Post {...post} />
    </>
  );
  render(
    <Router>
      <Route path='/' component={PostSample} />
    </Router>
  );
  expect(screen.getByText(/7.13M/)).toBeInTheDocument();
  expect(screen.getByText(/45K/)).toBeInTheDocument();
});
