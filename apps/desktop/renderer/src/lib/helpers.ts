/* =========================================================
   Desktop Renderer Functions
   ========================================================= */

import type { MediaCard, CompletionStatus } from '@packages/types';


export async function handleTrailer(mediaCard: MediaCard) {
    if (mediaCard.sampleFilePath) { 
      await (window as any).api?.play(mediaCard.sampleFilePath);
    } else { 
      console.warn("No sample file path available to play.") 
    };
}

export async function handlePlay(mediaCard: MediaCard) {
    if (mediaCard.videoFilePath) { 
      await (window as any).api?.play(mediaCard.videoFilePath);
    } else { 
      console.warn("No video file path available to play.") 
    };
}

export function cleanEpisodeTitle(title: string) {
  return title.replace(/\.(mkv|mp4)$/i, '');
}

export function formatHMM(totalSec: number): string {
  const totalMinutes = Math.round(totalSec / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${h}:${pad(m)}`;
}

export function completionStatusToText(cs: CompletionStatus | undefined): string {
  switch(cs) {
    case "Y": return "Y";
    case "O": return "Ongoing";
    case "U": return "Unknown";
    default:  return "Unknown";
  }
}

export function pixelQualityToText(pq: number | string): string {
  switch(pq) {
    case 7680: return "8K";
    case 3840: return "4K";
    case 1440: return "2K";
    case 1080: return "UHD";
    case 720:  return "HD";
    case 480:  return "SD";
    default:   return "Unknown";
  }
}
