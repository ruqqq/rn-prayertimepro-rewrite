import 'react-native';
import React from 'react';
import App from './App';
import { render } from '@testing-library/react-native';

it('renders correctly', async () => {
  render(<App />);
  await new Promise(r => setTimeout(r, 0));
});
