import { useEffect, useMemo, useState } from "react";
import type { ScreenProps, MovieCard } from "./";
import Poster from "../components/Poster";

type Props = ScreenProps["Browse"];

function Browse({ contentPath, kind, onBack }: Props) {
  const [cards, setCards] = useState<MovieCard[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list: MovieCard[] = await (window as any).api.listMovies(contentPath);
        if (alive) {
          setCards(list);
        }
      } catch (e) {
        console.error("listMovies failed:", e);
      }
    })();
    return () => { alive = false; };
  }, [contentPath, kind]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = cards;
    if (!s) return base;
    return base.filter(c =>
      c.title.toLowerCase().includes(s) ||
      String(c.year ?? "").includes(s)
    );
  }, [cards, q, kind]);

  return (
    <div className="browse-wrap">
      {/* Top nav */}
      <div className="nav">
        <button className="back" onClick={onBack}>&larr;</button>
        <div className="nav-center">
          <input
            className="search"
            placeholder="Search titles…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="profile" title="Profile">🙂</div>
      </div>
      {/* Filter row */}
      <div className="filters">
        <button className="chip" disabled>Genre</button>
        <button className="chip" disabled>Year</button>
        <button className="chip" disabled>Type</button>
      </div>
      {/* Cards list */}
      <div className="cards">
        {filtered.map(m => (
          <div className="movie-card">
            <div className="poster">
              {m.posterPath ? 
              (<Poster path={m.posterPath} title={m.title} />) : 
              (<div className="poster-fallback" aria-hidden />)}
            </div>
            <div className="card-body">
              <div className="title-row">
                <div className="title" title={m.title}>{m.title}</div>
              </div>
              <div className="meta">
                {m.year ? <span>{m.year}</span> : null}
                <span className="dot">•</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Browse;