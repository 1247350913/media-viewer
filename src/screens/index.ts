export type ScreenName = 
  | "Launch"
  | "Browse"
  | "Selection"
  | "SeriesList"
  | "Seasons"
  | "Show"
export type MediaKind = 'all' | 'movies' | 'shows';
export type Quality = 7680 | 3840 | 1440 | 1080 | 720 | 480 | 'Unknown';
export type MediaCard = {
  title: string;
  kind: MediaKind;
  posterPath?: string;
  videoFilePath?: string;
  sampleFilePath?: string;
  year?: number;
  description?: string;
  quality?: Quality;
  runtimeSeconds?: number;
  audios?: string[];
  subs?: string[];
  videoCodec?: string;
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