import * as Shared from ".";

export function formatHHMMSS(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function heightToQuality(h?: number): number | "Unknown" {
  if (!h) return "Unknown";
  if (h >= 7680) return 4320;  //8K
  if (h >= 3840) return 3840;  //4K
  if (h >= 2160) return 2160;
  if (h >= 1440) return 1440;
  if (h >= 1080) return 1080; 
  if (h >= 720) return 720;  
  if (h >= 480) return 480;
  return "Unknown";
}

export function pixelQualityToText(pq: number | string): string {
  switch(pq) {
    case 7680: return "8K";
    case 3840: return "4K";
    case 1440: return "2K";
    case 1080: return "1080p";
    case 720:  return "720p";
    case 480:  return "480p";
    default:   return "Unknown";
  }
}