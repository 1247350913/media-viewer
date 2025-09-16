import { useEffect, useState } from "react";

function Poster({ path, title }: { path?: string; title: string }) {
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

  return (
    <div className="poster">
      {src ? (<img src={src} alt={`${title} poster`} className="poster-img" />) : (<div className="poster-fallback" aria-hidden />)}
    </div>
  );
}

export default Poster;