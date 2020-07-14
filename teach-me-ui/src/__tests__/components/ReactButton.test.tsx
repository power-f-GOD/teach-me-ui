// import dependencies
import React from 'react';

// importing jest mock for mediaqueries
import '../__mocks__/matchMedia.mock';

// import react-testing methods
import { render, fireEvent, waitFor, screen } from '@testing-library/react';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom/extend-expect';

import ReactButton from '../../components/crumbs/ReactButton';

test('loads and displays placeholder text', async () => {
  render(
    <>
      <ReactButton id='1' type='upvote' reactions={15002} reacted='upvote' />
      <ReactButton id='2' type='upvote' reactions={1500200} reacted='neutral' />
      <ReactButton
        id='3'
        type='downvote'
        reactions={150020}
        reacted='downvote'
      />
    </>
  );
  expect(screen.getByText(/15K/)).toHaveStyle('color: green');
  expect(screen.getByText(/1.50M/)).toHaveStyle('color: #555');
  expect(screen.getByText(/150K/)).toHaveStyle('color: red');
});
