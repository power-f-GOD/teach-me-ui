// import dependencies
import React from 'react';

// import react-testing methods
import { render, fireEvent, waitFor, screen } from '@testing-library/react';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom/extend-expect';

import ReactButton from '../../components/crumbs/ReactButton';


test('loads and displays placeholder text', async () => {
  render(
    <>
      <ReactButton id='1' type='UPVOTE' reactions={15002} reacted='UPVOTE' />
      <ReactButton id='2' type='UPVOTE' reactions={1500200} reacted='NEUTRAL' />
      <ReactButton
        id='3'
        type='DOWNVOTE'
        reactions={150020}
        reacted='DOWNVOTE'
      />
    </>
  );
  expect(screen.getByText(/15K/)).toHaveStyle('color: green');
  expect(screen.getByText(/1.50M/)).toHaveStyle('color: #555');
  expect(screen.getByText(/150K/)).toHaveStyle('color: red');
});
