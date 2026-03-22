/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('../src/assets/models/aether-crystal.glb', () => 1, { virtual: true });
jest.mock('react-native-filament', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Camera: View,
    DefaultLight: View,
    FilamentScene: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(View, null, children),
    FilamentView: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(View, null, children),
    Model: View,
    useCameraManipulator: () => ({
      grabBegin: jest.fn(),
      grabUpdate: jest.fn(),
      grabEnd: jest.fn(),
      scroll: jest.fn(),
      update: jest.fn(),
    }),
  };
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('renders correctly', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    jest.advanceTimersByTime(1800);
  });

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
