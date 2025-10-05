export type ScreenName =
  | "Launch"
  | "Browse"
  | "Selection"
  | "SeriesList"
  | "Seasons"
  | "Show"
  | "Franchise"
  | "Profile";

export type MediaKind = 'all' | 'movie' | 'show';
export type Quality = 7680 | 3840 | 1440 | 1080 | 720 | 480 | 'Unknown';
export type Rating = 'F' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS'
export type Genre =
  | 'Action'
  | 'Adventure'
  | 'Animation'
  | 'Biography'
  | 'Comedy'
  | 'Crime'
  | 'Drama'
  | 'Family'
  | 'Fantasy'
  | 'Film-Noir'
  | 'History'
  | 'Horror'
  | 'Music'
  | 'Musical'
  | 'Mystery'
  | 'News'
  | 'Reality-TV'
  | 'Romance'
  | 'Sci-Fi'
  | 'Short'
  | 'Sport'
  | 'Talk-Show'
  | 'Thriller'
  | 'War'
  | 'Western';
export type Tag = 'TC' | 'DC' | 'EC' | 'SE' | 'UR/UC'
export type CompletionStatus = "Y" | "O" | "U"

export type MediaCard = {
  title: string;
  year?: number;
  overview?: string;
  genres?: Genre[];
  tags?: string[];
  adminRating?: Rating;

  kind: MediaKind;

  posterPath?: string;
  videoFilePath?: string;
  sampleFilePath?: string;

  quality?: Quality;
  runtimeSeconds?: number;
  audios?: string[];
  subs?: string[];
  videoCodec?: string;

  userRating?: Rating;

  isSeries?: boolean;
  dirPath?: string;
  isFranchise?: boolean;
  franchiseNumber?: number;

  seasonNumber?: number;
  episodeNumber?: number;
  episodeOverallNumber?: number;
  numberOfEpisodesObtained?: number;
  totalNumberOfEpisodes?: number;
  noSeasons?: boolean;
  completionStatus?: CompletionStatus;
};

export type SeasonTuple = [number, [MediaCard, MediaCard[]]] | null; // [seasonNum, [seasonCard, [episodeCards..]]]

export type HistoryEntry = {
  screenName: ScreenName;
  mediaCard: MediaCard | null;
};

export type ScreenProps = {
  Launch: {
    onLoaded: (contentPath: string) => void;
  };
  Browse: {
    contentPath: string;
    onOpenCard: (mediaCard: MediaCard) => void;
    onBack: () => void;
    onProfileClick: () => void;
  };
  Selection: {
    mediaCard: MediaCard | null;
    onBack: () => void;
    onProfileClick: () => void;
  };
  Seasons: {
    mediaCard: MediaCard | null;
    seasons: SeasonTuple;
    onBack: () => void;
    onProfileClick: () => void;
  };
  SeriesList: {
    mediaCard: MediaCard | null;
    onGo: (mediaCard: MediaCard) => void;
    onBack: () => void;
    onProfileClick: () => void;
  };
  Show: {
    mediaCard: MediaCard | null;
    onGo: (seasons: SeasonTuple) => void;
    onBack: () => void;
    onProfileClick: () => void;
  };
  Franchise: {
    mediaCard: MediaCard;
    onGo: (mediaCard: MediaCard) => void;
    onBack: () => void;
    onProfileClick: () => void;
  };
  Profile: {
    onBack: () => void;
  }
};