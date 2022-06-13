import 'react-native';
import React from 'react';
import AppContainer from './App';
import { render } from '@testing-library/react-native';

it('renders correctly', async () => {
  render(<AppContainer />);
  await new Promise(r => setTimeout(r, 0));
});
