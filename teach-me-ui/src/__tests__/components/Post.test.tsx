// import dependencies
import React from 'react';

// import react-testing methods
import { render, fireEvent, waitFor, screen } from '@testing-library/react';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom/extend-expect';

import Post from '../../components/crumbs/Post';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import { PostPropsState } from '../../constants';
import { Provider } from 'react-redux';
import store from '../../appStore';

const post: PostPropsState = {
  sender_id: '1',
  id: '1',
  media: [],
  posted_at: 123456,
  reposts: 1,
  type: 'post',
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
  render(
    <Provider store={store}>
      <Router>
        <Route
          path='/'
          render={(props: any) => <Post {...props} {...post} />}
        />
      </Router>
    </Provider>
  );
  expect(
    screen.getAllByText(/^(\d{1,3}(\.?\dK)?|\d{1,3}(\.\d)?M)$/)
  ).toBeTruthy();
});
