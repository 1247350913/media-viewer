import { useEffect, useState } from "react";
import { type ScreenName } from "../../shared";

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
      <div className="browse__poster--wrap">
        {src ? (<img src={src} alt={`${title} poster`} className="browse__poster--img" />) : (<div className="browse-poster-fallback" aria-hidden />)}
      </div>
    )
    case "Franchise": return (
      <div className="franchise__poster--wrap">
        {src ? (<img src={src} alt={`${title} poster`} className="franchise__poster--img" />) : (<div className="franchise-poster-fallback" aria-hidden />)}
      </div>
    )
    case "SeriesList": return (
      <div className="serieslist-poster-wrap">
        {src ? (<img src={src} alt={`${title} poster`} className="serieslist-poster--img" />) : (<div className="serieslist-poster-fallback" aria-hidden />)}
      </div>
    )
    case "Show": return (
      <div className="show-poster-wrap">
        {src ? (<img src={src} alt={`${title} poster`} className="show-poster--img" />) : (<div className="show-poster-fallback" aria-hidden />)}
      </div>
    )
    case "Seasons": return (
      <div className="seasons-poster-wrap">
        {src ? (<img src={src} alt={`${title} poster`} className="seasons-poster--img" />) : (<div className="seasons-poster--fallback" aria-hidden />)}
      </div>
    )
    case "Selection": return (
      <div className="selection__poster--wrap">
        {src ? (<img src={src} alt={`${title} poster`} className="selection__poster--img" />) : (<div className="selection__poster--fallback" aria-hidden />)}
      </div>
    )
  }
}

export default Poster;