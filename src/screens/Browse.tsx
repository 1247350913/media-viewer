import { useEffect, useMemo, useState } from "react";
import type { ScreenProps, MediaCard, MediaKind } from "./";
import Poster from "../components/Poster";


type Props = ScreenProps["Browse"];

function Browse({ contentPath, onBack }: Props) {
  const [cards, setCards] = useState<MediaCard[]>([]);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<MediaKind>("all");
  const [showKind, setShowKind] = useState(false);

  useEffect(() => {
    let alive = true;
    getAllCards(alive);
    return () => { alive = false; };
  }, [contentPath]);

  async function getAllCards(alive: boolean) {
    try {
      const list: MediaCard[] = await (window as any).api.listLevel1All(contentPath);
      if (!alive) return;
      const sorted = (list ?? []).slice().sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" }));
      setCards(sorted);
    } catch (e) {
      console.error("listLevel1All failed:", e);
      if (alive) setCards([]);
    }
  }

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
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="profile" title="Profile">🙂</div>
      </div>

      {/* Filters row */}
      <div className="filters">
        <div className="kind-filter">
          <button
            className="chip"
            aria-expanded={showKind}
            onClick={() => setShowKind((v) => !v)}
          >
            Type: {kind === "all" ? "All" : kind.charAt(0).toUpperCase() + kind.slice(1)}
          </button>

          {showKind && (
            <div className="kind-menu" role="menu">
              {(["all", "movies", "shows", "docs"] as MediaKind[]).map((k) => (
                <button
                  key={k}
                  role="menuitemradio"
                  aria-checked={kind === k}
                  className={`kind-item${kind === k ? " is-active" : ""}`}
                  onClick={() => {
                    setKind(k);
                    setShowKind(false);
                  }}
                >
                  {k === "all" ? "All" : k.charAt(0).toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="chip" disabled>Genre</button>
        <button className="chip" disabled>Year</button>
        <button className="chip" disabled>Rating</button>
      </div>

      {/* Cards */}
      {cards === null ? ( <div className="loading">Loading…</div> ) : 
      (
        <div className="cards">
          {filtered.map((m, i) => (
            <div className="movie-card" key={`${m.title}-${m.year ?? ""}-${i}`}>
              {/* Poster */}
              <div className="poster">
                {m.posterPath ? (
                  <Poster path={m.posterPath} title={m.title} />
                ) : (
                  <div className="poster-fallback" aria-hidden />
                )}
              </div>

              {/* Body */}
              <div className="card-body">
                <div className="title-row">
                  <div className="title" title={m.title}>{m.title}</div>
                </div>
                <div className="meta">
                  {m.year ? <span>{m.year}</span> : null}
                  <span className="dot">•</span>
                  <span>{(m.kind ?? "movies").toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}

          {cards.length > 0 && filtered.length === 0 && (
            <div className="empty">No matches.</div>
          )}

          {cards.length === 0 && (
            <div className="empty">No items found.</div>
          )}
        </div>
      )}

    </div>
  );
}

export default Browse;