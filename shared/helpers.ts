import * as Shared from ".";

export function formatHMM(totalSec: number): string {
  const totalMinutes = Math.round(totalSec / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${h}:${pad(m)}`;
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
    case 1080: return "UHD";
    case 720:  return "HD";
    case 480:  return "SD";
    default:   return "Unknown";
  }
}

export function completionStatusToText(cs: Shared.CompletionStatus | undefined): string {
  switch(cs) {
    case "Y": return "Y";
    case "O": return "Ongoing";
    case "U": return "Unknown";
    default:  return "Unknown";
  }
}