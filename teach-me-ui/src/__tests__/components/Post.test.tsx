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

const post: Partial<Omit<PostPropsState, 'sender'>> & {
  sender: Partial<PostPropsState['sender']>;
} = {
  sender: {
    id: '1',
    first_name: 'Benjamin',
    last_name: 'Chibuzor-Orie',
    username: 'iambenkay'
  },
  media: [],
  date: 123456,
  repost_count: 1,
  type: 'post',
  downvote_count: 2450,
  upvote_count: 7134561,
  reply_count: 45271,
  text:
    'Where do people go when they die? Same place they were before they were born!',
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
