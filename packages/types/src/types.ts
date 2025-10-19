/* =========================================================
   GLOBAL TYPES
   ========================================================= */

  /* ============== Card ============== */

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

  /* ============== Card Properties ============== */

export type MediaKind = 'all' | 'movie' | 'show' | 'documentary'

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
  | 'Musical'
  | 'Mystery'
  | 'Reality-TV'
  | 'Romance'
  | 'Sci-Fi'
  | 'Thriller'
  | 'War'
  | 'Western';

export type Tag = 'TC' | 'DC' | 'EC' | 'SE' | 'UR/UC'

export type CompletionStatus = "Y" | "O" | "U"
