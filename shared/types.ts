/* =========================================================
   SHARED (electron + src)
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


/* =========================================================
   Used in src ONLY
   ========================================================= */

  /* ============== Shared / Global ============== */

export type NavHistoryEntry = {
  screenName: ScreenName;
  mediaCard: MediaCard | null;
};

export type ScreenName =
  | "Login"
  | "Launch"
  | "Browse"
  | "Franchise"
  | "SeriesList"
  | "Show"
  | "Seasons"
  | "Selection"
  | "Profile";


  /* ============== Components ============== */

  /* ============== Screens ============== */

// [seasonNum, [seasonCard, [episodeCards..]]]
export type SeasonTuple = [number, [MediaCard, MediaCard[]]] | null;

  /* ============== Props ============== */

export type ComponentProps = {
  Poster: {
    path?: string
    title: string
    screenName: ScreenName
  };
  HeaderBar: {
    screenName: ScreenName
    onBack: () => void
    onProfileClick: () => void
    q?: string
    onChange?: (e: any) => void
    mediaCard?: MediaCard
    count?: number
  };
  ActionButtonRow: {
    screenName: ScreenName
    mediaCard: MediaCard
    onGo?: () => void
  };
  MetaChipsRow: {

  };
}

export type ScreenProps = {
  Login: {
    onSuccess: () => void
  }
  Launch: {
    onLoaded: (contentPath: string) => void
    onBack: () => void
    onProfileClick: () => void
  };
  Browse: {
    contentPath: string
    onOpenCard: (mediaCard: MediaCard) => void
    onBack: () => void
    onProfileClick: () => void
  };
  Selection: {
    mediaCard: MediaCard | null
    onBack: () => void
    onProfileClick: () => void
  };
  Seasons: {
    mediaCard: MediaCard | null
    seasons: SeasonTuple
    onBack: () => void
    onProfileClick: () => void
  };
  SeriesList: {
    mediaCard: MediaCard | null
    onGo: (mediaCard: MediaCard) => void
    onBack: () => void
    onProfileClick: () => void
  };
  Show: {
    mediaCard: MediaCard | null
    onGo: (seasons: SeasonTuple) => void
    onBack: () => void
    onProfileClick: () => void
  };
  Franchise: {
    mediaCard: MediaCard
    onGo: (mediaCard: MediaCard) => void
    onBack: () => void
    onProfileClick: () => void
  };
  Profile: {
    onBack: () => void
  }
};