/**
 * Icon component that supports both SVG and image assets
 */

import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';

// Icon name type
export type IconName =
  | 'back'
  | 'edit'
  | 'delete'
  | 'close'
  | 'eye'
  | 'eye-close'
  | 'phone'
  | 'menu'
  | 'star'
  | 'ok'
  | 'cancel'
  | 'remove'
  | 'white-remove'
  | 'change'
  | 'dropdown'
  | 'arrow-left'
  | 'arrow-down'
  | 'arrow-down-black'
  | 'geolocation'
  | 'gps'
  | 'logo'
  | 'logo-circle'
  | 'facebook'
  | 'instagram'
  | 'whatsapp'
  | 'viber'
  | 'selected-radio'
  | 'deselected-radio'
  | 'pending'
  | 'tablo-green'
  | 'tablo-grey'
  | 'profile'
  | 'calendar'
  | 'orders'
  | 'settings';

// Dynamic SVG loader
const loadSvgIcon = (name: IconName): React.ComponentType<SvgProps> | null => {
  try {
    switch (name) {
      case 'back':
        return require('../../assets/svgs/back.svg').default;
      case 'edit':
        return require('../../assets/svgs/edit.svg').default;
      case 'delete':
        return require('../../assets/svgs/delete.svg').default;
      case 'close':
        return require('../../assets/svgs/close.svg').default;
      case 'eye':
        return require('../../assets/svgs/eye.svg').default;
      case 'eye-close':
        return require('../../assets/svgs/eye-close.svg').default;
      case 'phone':
        return require('../../assets/svgs/phone.svg').default;
      case 'menu':
        return require('../../assets/svgs/menu.svg').default;
      case 'star':
        return require('../../assets/svgs/star.svg').default;
      case 'ok':
        return require('../../assets/svgs/ok.svg').default;
      case 'cancel':
        return require('../../assets/svgs/cancel.svg').default;
      case 'remove':
        return require('../../assets/svgs/remove.svg').default;
      case 'white-remove':
        return require('../../assets/svgs/whiteRemove.svg').default;
      case 'change':
        return require('../../assets/svgs/change.svg').default;
      case 'dropdown':
        return require('../../assets/svgs/dropDown.svg').default;
      case 'arrow-left':
        return require('../../assets/svgs/arrow-left.svg').default;
      case 'arrow-down':
        return require('../../assets/svgs/arrow-down.svg').default;
      case 'arrow-down-black':
        return require('../../assets/svgs/arrow-down-black.svg').default;
      case 'geolocation':
        return require('../../assets/svgs/geolocation.svg').default;
      case 'gps':
        return require('../../assets/svgs/gps.svg').default;
      case 'logo':
        return require('../../assets/svgs/logo.svg').default;
      case 'logo-circle':
        return require('../../assets/svgs/logo_circle.svg').default;
      case 'facebook':
        return require('../../assets/svgs/facebook.svg').default;
      case 'instagram':
        return require('../../assets/svgs/istagram.svg').default;
      case 'whatsapp':
        return require('../../assets/svgs/whatsApp.svg').default;
      case 'viber':
        return require('../../assets/svgs/viber.svg').default;
      case 'selected-radio':
        return require('../../assets/svgs/selected-radiobutton.svg').default;
      case 'deselected-radio':
        return require('../../assets/svgs/disselected-radiobutton.svg').default;
      case 'pending':
        return require('../../assets/svgs/pending-icon.svg').default;
      case 'tablo-green':
        return require('../../assets/svgs/tablo-green.svg').default;
      case 'tablo-grey':
        return require('../../assets/svgs/tablo-grey.svg').default;
      case 'profile':
        return require('../../assets/svgs/profile.svg').default;
      case 'calendar':
        return require('../../assets/svgs/calendar.svg').default;
      case 'orders':
        return require('../../assets/svgs/orders.svg').default;
      case 'settings':
        return require('../../assets/svgs/settings.svg').default;
      default:
        return null;
    }
  } catch (error) {
    console.warn(`Failed to load icon: ${name}`, error);
    return null;
  }
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  width,
  height,
  style,
}) => {
  const IconComponent = loadSvgIcon(name);
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const iconWidth = width || size;
  const iconHeight = height || size;

  return (
    <IconComponent
      width={iconWidth}
      height={iconHeight}
      fill={color}
      stroke={color}
      style={style}
    />
  );
};

// Image icon component for PNG/JPG icons
import { ImageStyle } from 'react-native';

interface ImageIconProps {
  source: ImageSourcePropType;
  size?: number;
  style?: ImageStyle;
  tintColor?: string;
}

export const ImageIcon: React.FC<ImageIconProps> = ({
  source,
  size = 24,
  style,
  tintColor,
}) => {
  return (
    <Image
      source={source}
      style={[
        {
          width: size,
          height: size,
          tintColor,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};
