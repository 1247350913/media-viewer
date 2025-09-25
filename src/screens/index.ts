export type Screen = 'Launch' | 'Browse';
export type MediaKind = 'all' | 'movies' | 'shows';
export type MediaCard = {
  title: string;
  kind: MediaKind
  year?: number;
  posterPath?: string;
};
export type ScreenProps = {
  Launch: {
    onLoaded: (contentPath: string) => void;
  };
  MediaType: {
    value: MediaKind;
    onPick: (k: MediaKind) => void;
  };
  Browse: {
    contentPath: string;
  };
};

export { default as Launch } from './Launch';
export { default as Browse } from './Browse';