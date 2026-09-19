import { Circle, Path, Svg } from 'react-native-svg';

export type IconName =
  | 'bell'
  | 'campaign'
  | 'chevron-down'
  | 'dollar'
  | 'exchange'
  | 'filter'
  | 'heart'
  | 'help'
  | 'home'
  | 'listings'
  | 'pin'
  | 'plus'
  | 'profile'
  | 'search'
  | 'tag';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 20, color = '#171717', strokeWidth = 1.8 }: IconProps) {
  const props = {
    fill: 'none' as const,
    stroke: color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth,
  };

  switch (name) {
    case 'bell':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" {...props} />
          <Path d="M13.7 21a2 2 0 0 1-3.4 0" {...props} />
        </Svg>
      );
    case 'pin':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" {...props} />
          <Circle cx="12" cy="10" r="2.5" {...props} />
        </Svg>
      );
    case 'chevron-down':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Path d="m6 9 6 6 6-6" {...props} />
        </Svg>
      );
    case 'search':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Circle cx="11" cy="11" r="7" {...props} />
          <Path d="m20 20-4-4" {...props} />
        </Svg>
      );
    case 'tag':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Path
            d="M20.59 13.41 13.41 20.59a2 2 0 0 1-2.82 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"
            {...props}
          />
          <Path d="M7 7h.01" {...props} />
        </Svg>
      );
    case 'exchange':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Path d="m17 3 4 4-4 4" {...props} />
          <Path d="M3 7h18" {...props} />
          <Path d="m7 21-4-4 4-4" {...props} />
          <Path d="M21 17H3" {...props} />
        </Svg>
      );
    case 'dollar':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Path d="M12 2v20" {...props} />
          <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" {...props} />
        </Svg>
      );
    case 'help':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Circle cx="12" cy="12" r="9" {...props} />
          <Path d="M9.8 9a2.3 2.3 0 1 1 3.8 1.7c-1 .8-1.6 1.2-1.6 2.5" {...props} />
          <Path d="M12 16h.01" {...props} />
        </Svg>
      );
    case 'filter':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Path d="M4 6h16M4 12h16M4 18h16" {...props} />
          <Circle cx="8" cy="6" r="2" {...props} />
          <Circle cx="16" cy="12" r="2" {...props} />
          <Circle cx="10" cy="18" r="2" {...props} />
        </Svg>
      );
    case 'heart':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Path
            d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"
            {...props}
          />
        </Svg>
      );
    case 'home':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" {...props} />
          <Path d="M9 21v-6h6v6" {...props} />
        </Svg>
      );
    case 'listings':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Path d="m17 3 4 4-4 4" {...props} />
          <Path d="M3 7h18" {...props} />
          <Path d="m7 21-4-4 4-4" {...props} />
          <Path d="M21 17H3" {...props} />
        </Svg>
      );
    case 'campaign':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Path d="M3 7h18v13H3z" {...props} />
          <Path d="M3 7 5 3h14l2 4" {...props} />
          <Path d="M8 11h8" {...props} />
        </Svg>
      );
    case 'profile':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Circle cx="12" cy="8" r="4" {...props} />
          <Path d="M4 21a8 8 0 0 1 16 0" {...props} />
        </Svg>
      );
    case 'plus':
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
          <Path d="M12 5v14M5 12h14" {...props} />
        </Svg>
      );
  }
}
