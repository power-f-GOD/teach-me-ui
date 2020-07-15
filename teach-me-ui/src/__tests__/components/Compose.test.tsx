// import dependencies
import React from 'react';

// import react-testing methods
import { render, fireEvent, waitFor, screen } from '@testing-library/react';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom/extend-expect';

// importing jest mock for mediaqueries
import '../__mocks__/matchMedia.mock.ts';

import Compose from '../../components/crumbs/Compose';

test('loads and displays placeholder text', async () => {
  render(<Compose />);
  expect(screen.getByText(/What's/)).toHaveTextContent("What's on");
});
