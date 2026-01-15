/**
 * Central export for all icon-related components and utilities
 */

export { Icon, ImageIcon, type IconName } from './Icon';

// Export image icon sources for convenience
export const imageIcons = {
  taxi: require('./taxi.png'),
  taxiDriver: require('./taxi-driver.png'),
  location: require('./location.png'),
  pin: require('./pin.png'),
  folders: require('./folders.png'),
  bottomImage: require('./bottomImage.png'),
  deleteAccount: require('./deleteAccount.jpg'),
} as const;
