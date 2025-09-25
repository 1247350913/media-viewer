export type Screen = 
  | { name: "Launch" }
  | { name: "Browse" }
  | { name: "Selection"; mediaCard: MediaCard }
  | { name: "SeriesList"; mediaCard: MediaCard }
  | { name: "Seasons"; mediaCard: MediaCard }
  | { name: "Show"; mediaCard: MediaCard }
export type MediaKind = 'all' | 'movies' | 'shows';
export type MediaCard = {
  title: string;
  kind: MediaKind;
  year?: number;
  posterPath?: string;
  videoFilePath?: string;
  description?: string;
  runtimeMin?: number;
  audio?: string[];
  subs?: string[];
  isSeries?: boolean;
};
export type ScreenProps = {
  Launch: {
    onLoaded: (contentPath: string) => void;
  };
  Browse: {
    contentPath: string;
    onOpenCard: (card: MediaCard) => void;
  };
  Selection: {
    mediaCard: MediaCard;
    onBack: () => void;
  };
  Seasons: {
    mediaCard: MediaCard;
    onBack: () => void;
  };
  SeriesList: {
    mediaCard: MediaCard;
    onBack: () => void;
  };
  Show: {
    mediaCard: MediaCard;
    onBack: () => void;
  };
};

export { default as Launch } from './Launch';
export { default as Browse } from './Browse';
export { default as Selection } from './Selection';
export { default as Seasons } from './Seasons';
export { default as SeriesList } from './SeriesList';
export { default as Show } from './Show';