import { useEffect, useMemo, useState } from "react";
import type { ScreenProps, MediaCard, MediaKind } from "../../shared";
import Poster from "../components/Poster";


type Props = ScreenProps["Browse"];

function Browse({ contentPath, onOpenCard, onBack }: Props) {
  const [cards, setCards] = useState<MediaCard[] | null>(null);
  const [q, setQ] = useState("");
  const [kindFilters, setKindFilters] = useState<MediaKind[]>(["all"]);
  const [showKindsDropdown, setShowKindsDropdown] = useState(false);

  const mediaKindsToLabels = {
    all: "All",
    movie: "Movies",
    show: "Shows",
    documentary: "Documentaries"
  };

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
      c.title.toLowerCase().includes(s)
    );
  }, [cards, q, kindFilters]);

  return (
    <div className="screen-wrap browse-wrap">

      {/* Standard Header */}
      <div className="header-bar-wrap browse-bar-wrap">
        <button className="back-button" onClick={onBack}>←</button>
        <div className="search-bar-wrap">
          <input
            className="searcher"
            placeholder="Search titles…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="profile-wrap" title="Profile">
          <img src="../../public/default-profile-icon.png" alt="Profile Image" className="profile-icon"/>
        </div>
      </div>

      {/* Filters row */}
      <div className="subheader-buttons-bar-wrap browse-filter-bar-wrap">
        <div className="subheader-button-wrap">
          <button className="subheader-button" aria-expanded={showKindsDropdown} onClick={() => setShowKindsDropdown((v) => !v)}>Type</button>
          {showKindsDropdown && (
            <div className="subheader-button-menu" role="menu">
              {(["all", "movie", "show", "documentary"] as MediaKind[]).map(k => {
                const active = kindFilters.includes(k);
                return (
                  <button
                    key={k}
                    role="menuitemcheckbox"
                    aria-checked={active}
                    className={`dropdown-entry${active ? " is-active" : ""}`}
                    onClick={() => toggleKind(k)}
                  >
                    {mediaKindsToLabels[k]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <button className="subheader-button" disabled>Genre</button>
        <button className="subheader-button" disabled>Year</button>
        <button className="subheader-button" disabled>Rating</button>
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
                  {/* {m.year ? <span>{m.year}</span> : null} */}
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