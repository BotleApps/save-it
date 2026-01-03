import React from 'react';
import renderer from 'react-test-renderer';
import { CardsReader } from '../CardsReader';
import * as colorsModule from '@/constants/colors';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('CardsReader', () => {
  it('renders readable text in light theme', () => {
    jest.spyOn(colorsModule, 'useTheme').mockReturnValue('light');
    jest.spyOn(colorsModule, 'useColors').mockReturnValue(colorsModule.lightColors as any);

    const tree = renderer.create(<CardsReader content={'This is a test. Another sentence.'} />).toJSON();
    expect(tree).toBeTruthy();
  });
});
