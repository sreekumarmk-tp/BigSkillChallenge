import { getShadow, getTextShadow } from '../neonTheme';
import { Platform } from 'react-native';

describe('neonTheme', () => {
  it('should return correct shadow for iOS/Android', () => {
    Platform.OS = 'ios';
    const shadow = getShadow('#00F0FF');
    expect(shadow).toHaveProperty('shadowColor', '#00F0FF');
    expect(shadow).toHaveProperty('shadowOpacity', 0.25);
  });

  it('should return correct shadow for Web', () => {
    Platform.OS = 'web';
    const shadow = getShadow('#00F0FF');
    expect(shadow).toHaveProperty('boxShadow');
    expect(shadow.boxShadow).toContain('0px 8px 15px #00F0FF');
  });

  it('should return correct text shadow', () => {
    const shadow = getTextShadow();
    expect(shadow).toHaveProperty('textShadowColor');
    expect(shadow.textShadowRadius).toBe(5);
  });
});
