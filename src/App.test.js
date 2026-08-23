import { render } from '@testing-library/react';
import App from './App';

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

test('renders the app without crashing', () => {
  render(<App />);
});
