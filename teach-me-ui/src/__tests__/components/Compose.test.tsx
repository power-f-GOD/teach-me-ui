// import dependencies
import React from 'react';

// import react-testing methods
import { render, fireEvent, waitFor, screen } from '@testing-library/react';

import { connect } from 'react-redux';

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom/extend-expect';

import ComposeBase from '../../components/crumbs/Compose';

const Compose = connect(({ userData }: any) => ({ userData }))(ComposeBase);

test('loads and displays placeholder text', async () => {
  render(<Compose />);
  expect(screen.getByText(/What's/)).toHaveTextContent("What's on");
});
