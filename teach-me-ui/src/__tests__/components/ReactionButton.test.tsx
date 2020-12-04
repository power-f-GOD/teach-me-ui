// import dependencies
import React from 'react';

// import react-testing methods
import { render, fireEvent, waitFor, screen } from '@testing-library/react';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom/extend-expect';

import {ReactButton} from '../../components/crumbs/ReactionButton';

test('loads and displays placeholder text', async () => {
  render(
    <>
      <ReactButton
        id='1'
        type='UPVOTE'
        num_of_reactions={15002}
        reaction='UPVOTE'
      />
      <ReactButton
        id='2'
        type='UPVOTE'
        num_of_reactions={1500200}
        reaction='NEUTRAL'
      />
      <ReactButton
        id='3'
        type='DOWNVOTE'
        num_of_reactions={150020}
        reaction='DOWNVOTE'
      />
    </>
  );
  expect(screen.getByText(/15K/)).toHaveTextContent(/15K/);
  expect(screen.getByText(/1.50M/)).toHaveTextContent(/1.50M/);
  expect(screen.getByText(/150K/)).toHaveTextContent(/150K/);
});
