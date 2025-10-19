/* =========================================================
   Desktop Renderer Types
   ========================================================= */

import type { MediaCard } from '@packages/types';


/* ============== Renderer Types ============== */

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

export type NavHistoryEntry = {
  screenName: ScreenName;
  mediaCard: MediaCard | null;
};

export type SeasonTuple = [number, [MediaCard, MediaCard[]]] | null;  // [seasonNum, [seasonCard, [episodeCards..]]]


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
