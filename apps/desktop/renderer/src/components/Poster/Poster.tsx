import { useEffect, useState } from "react";
import * as Shared from "../../shared";

type Props = Shared.ComponentProps["Poster"];

function Poster({ path, title, screenName }: Props ) {
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
        {src ? (<img src={src} alt={`${title} poster`} className="browse__poster--img" />) : (<div className="browse__poster-fallback" aria-hidden />)}
      </div>
    )
    case "Franchise": return (
      <div className="franchise__poster--wrap">
        {src ? (<img src={src} alt={`${title} poster`} className="franchise__poster--img" />) : (<div className="franchise__poster-fallback" aria-hidden />)}
      </div>
    )
    case "SeriesList": return (
      <div className="serieslist__poster--wrap">
        {src ? (<img src={src} alt={`${title} poster`} className="serieslist__poster--img" />) : (<div className="serieslist__poster-fallback" aria-hidden />)}
      </div>
    )
    case "Show": return (
      <div className="show__poster--wrap">
        {src ? (<img src={src} alt={`${title} poster`} className="show__poster--img" />) : (<div className="show__poster-fallback" aria-hidden />)}
      </div>
    )
    case "Seasons": return (
      <div className="seasons__poster--wrap">
        {src ? (<img src={src} alt={`${title} poster`} className="seasons__poster--img" />) : (<div className="seasons__poster--fallback" aria-hidden />)}
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