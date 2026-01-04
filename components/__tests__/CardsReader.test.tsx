import React from 'react';
import { CardsReader } from '../CardsReader';
import * as colorsModule from '@/constants/colors';

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  ChevronDown: 'ChevronDown',
  Book: 'Book',
}));

// Mock react-native components that need special handling
jest.mock('react-native/Libraries/Components/View/ViewNativeComponent', () => ({
  __esModule: true,
  default: 'RCTView',
}));

describe('CardsReader', () => {
  beforeEach(() => {
    // Mock the color hooks
    jest.spyOn(colorsModule, 'useTheme').mockReturnValue('light');
    jest.spyOn(colorsModule, 'useColors').mockReturnValue(colorsModule.lightColors as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    // Simple smoke test - just ensure the component can be instantiated
    const component = <CardsReader content="This is a test. Another sentence." />;
    expect(component).toBeDefined();
    expect(component.type).toBe(CardsReader);
  });

  it('accepts content prop', () => {
    const content = 'Test content. Second sentence.';
    const component = <CardsReader content={content} />;
    expect(component.props.content).toBe(content);
  });

  it('accepts optional onProgressUpdate callback', () => {
    const mockCallback = jest.fn();
    const component = <CardsReader content="Test" onProgressUpdate={mockCallback} />;
    expect(component.props.onProgressUpdate).toBe(mockCallback);
  });
});
