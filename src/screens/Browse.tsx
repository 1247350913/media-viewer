import { useEffect, useMemo, useState } from "react";
import type { ScreenProps, MediaCard, MediaKind } from "./";
import Poster from "../components/Poster";


type Props = ScreenProps["Browse"];

function Browse({ contentPath, onOpenCard }: Props) {
  const [cards, setCards] = useState<MediaCard[] | null>(null);
  const [q, setQ] = useState("");
  const [kindFilters, setKindFilters] = useState<MediaKind[]>(["all"]);
  const [showKindsDropdown, setShowKindsDropdown] = useState(false);

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

  function toggleKind(k: MediaKind) {
    if (k === "all") {
      setKindFilters(["all"]);
      return;
    }
    const withoutAll = kindFilters.filter(x => x !== "all");
    if (withoutAll.includes(k)) {
      const next = withoutAll.filter(x => x !== k);
      setKindFilters(next.length ? next : ["all"]);
    } else {
      setKindFilters([...withoutAll, k]);
    }
  }

  const filtered = useMemo(() => {
    const list = cards ?? [];
    const byKind = kindFilters.includes("all")
      ? list
      : list.filter(c => kindFilters.includes(c.kind));

    const s = q.trim().toLowerCase();
    if (!s) return byKind;

    return byKind.filter(c =>
      c.title.toLowerCase().includes(s) ||
      String(c.year ?? "").includes(s)
    );
  }, [cards, q, kindFilters]);

  return (
    <div className="browse-wrap">
      
      {/* Top nav */}
      <div className="nav">
        {/* <button className="back" onClick={onBack}>&larr;</button> */}
        <div></div>
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
          <button className="chip" aria-expanded={showKindsDropdown} onClick={() => setShowKindsDropdown((v) => !v)}>Type</button>
          {showKindsDropdown && (
            <div className="kind-menu" role="menu">
              {(["all", "movies", "shows", "docs"] as MediaKind[]).map(k => {
                const active = kindFilters.includes(k);
                return (
                  <button
                    key={k}
                    role="menuitemcheckbox"
                    aria-checked={active}
                    className={`kind-item${active ? " is-active" : ""}`}
                    onClick={() => toggleKind(k)}   // <-- uses the helper
                  >
                    {k === "all" ? "All" : k.charAt(0).toUpperCase() + k.slice(1)}
                  </button>
                );
              })}
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
            <div
              key={`${m.title}-${m.year ?? ""}-${i}`}
              className="movie-card is-clickable" 
              role="button"
              tabIndex={0}
              onClick={() => onOpenCard(m)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpenCard(m)}
            >
              {/* Poster */}
              <div className="poster">
                {m.posterPath ? (
                  <Poster path={m.posterPath} title={m.title} screenName={"Browse"} />
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
                  {/* <span className="dot">•</span> */}
                  {/* <span>{(m.kind ?? "movies").toUpperCase()}</span> */}
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