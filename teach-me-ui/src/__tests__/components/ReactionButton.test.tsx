// import dependencies
import React from 'react';

// import react-testing methods
import { render, fireEvent, waitFor, screen } from '@testing-library/react';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom/extend-expect';

import {ReactionButton} from '../../components/Main/Home/MiddlePane/Post/ReactionButton';

test('loads and displays placeholder text', async () => {
  render(
    <>
      <ReactionButton
        id='1'
        type='UPVOTE'
        num_of_reactions={15002}
        reaction='UPVOTE'
      />
      <ReactionButton
        id='2'
        type='UPVOTE'
        num_of_reactions={1500200}
        reaction='NEUTRAL'
      />
      <ReactionButton
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
