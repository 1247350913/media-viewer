export type Screen = 'Launch' | 'MediaType' | 'Browse';
export type MediaKind = 'all' | 'movies' | 'shows';
export type MovieCard = {
  title: string;
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
    kind: MediaKind;
    onBack: () => void;
  };
};

export { default as Launch } from './Launch';
export { default as MediaType } from './MediaType';
export { default as Browse } from './Browse';