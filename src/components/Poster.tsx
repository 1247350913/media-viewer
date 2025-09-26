import { useEffect, useState } from "react";
import type { ScreenName } from "..";

function Poster({ path, title, screenName }: { path?: string; title: string; screenName: ScreenName; }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!path) return;
      const dataUrl = await (window as any).api.readPoster(path);
      if (alive) setSrc(dataUrl ?? null);
    })();
    return () => { alive = false; };
  }, [path]);

  switch (screenName) {
    case "Browse": return (
      <div className="poster">
        {src ? (<img src={src} alt={`${title} poster`} className="poster-img" />) : (<div className="poster-fallback" aria-hidden />)}
      </div>
    )
    case "Selection": return (
      <div className="sel-poster">
        {src ? (<img src={src} alt={`${title} poster`} className="sel-poster-img" />) : (<div className="sel-poster-fallback" aria-hidden />)}
      </div>
    )
  }
}

export default Poster;