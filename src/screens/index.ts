import * as Shared from "../../shared";

export { default as Launch } from './Launch';
export { default as Browse } from './Browse';
export { default as Selection } from './Selection';
export { default as Seasons } from './Seasons';
export { default as SeriesList } from './SeriesList';
export { default as Show } from './Show';

export async function handlePlay(mediaCard: Shared.MediaCard) {
    if (mediaCard.videoFilePath) { 
      await (window as any).api?.play(mediaCard.videoFilePath);
    } else { 
      console.warn("No video file path available to play.") 
    };
}