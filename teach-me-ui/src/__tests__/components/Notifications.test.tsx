// import dependencies
import React from 'react';

// importing jest mock for mediaqueries
import '../__mocks__/matchMedia.mock';

// import react-testing methods
import { render, screen } from '@testing-library/react';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom/extend-expect';

import Notifications from '../../components/Main/Notifications';

test('loads and displays notifications', async () => {
  render(<Notifications />);
  expect(screen.getByText(/Notifications/)).toBeInTheDocument();
});
