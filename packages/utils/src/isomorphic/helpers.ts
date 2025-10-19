export function humanBytes(n?: number | null): string {
  if (!n || n <= 0) return "0 B";
  const u = ["B","KB","MB","GB","TB","PB"];
  const e = Math.floor(Math.log(n) / Math.log(1024));
  return `${(n / Math.pow(1024, e)).toFixed(1)} ${u[e]}`;
}

// very basic "Thor.2011.1080p" -> {title:"Thor", year:2011, quality:"1080p"}
export function parseTitle(input: string): { title: string; year?: number; quality?: string } {
  const m = input.match(/^(.*?)(?:[.\s(](19|20)\d{2}[)\s.]?)?(?:.*\b(480p|720p|1080p|2160p|4k)\b)?/i);
  return {
    title: (m?.[1] || input).replace(/[._]/g, " ").trim(),
    year: m?.[2] ? Number(m[2]) : undefined,
    quality: m?.[3]?.toLowerCase()
  };
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
