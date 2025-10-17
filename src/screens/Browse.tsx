import { useEffect, useMemo, useState, useRef } from "react";

import * as Shared from "../../shared";
import * as Components from "../components";

const screenName: Shared.ScreenName = "Browse"
type Props = Shared.ScreenProps[typeof screenName];

function Browse({ contentPath, onOpenCard, onBack, onProfileClick }: Props) {
  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<Shared.MediaCard[]>([]);
  const [q, setQ] = useState("");

  // Dropdowns
  const [kindFilters, setKindFilters] = useState<Shared.MediaKind[]>([]);
  const [showKindsDropdown, setShowKindsDropdown] = useState(false);
  const kindsWrapRef = useRef<HTMLDivElement | null>(null);  //click away to close menu
  const [genreFilters, setGenreFilters] = useState<Shared.Genre[]>([]);
  const [showGenresDropdown, setShowGenresDropdown] = useState(false);
  const genresWrapRef = useRef<HTMLDivElement | null>(null);  //click away to close menu
  const [yearFilter, setYearFilter] = useState<number | {} | null>(null);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const yearWrapRef = useRef<HTMLDivElement | null>(null);  //click away to close menu
  const [ratingFilters, setRatingFilters] = useState<Shared.Rating[]>([]);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);
  const ratingWrapRef = useRef<HTMLDivElement | null>(null);  //click away to close menu

  const KIND_OPTIONS: Shared.MediaKind[] = ["movie", "show", "documentary"];
  const GENRE_OPTIONS: Shared.Genre[] = ["Action", "Adventure", "Horror"];
  const RATING_OPTIONS: Shared.Rating[] = ["S", "A", "B", "C"];

  // Load level-1 across all kinds
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setIsLoading(true);
        const list: Shared.MediaCard[] =
          (await (window as any).api?.listLevel1All(contentPath)) ?? [];
        setIsLoading(false);
        if (!alive) return;
        const sorted = list
          .slice()
          .sort((a, b) =>
            (a.title || "").localeCompare(b.title || "", undefined, {
              sensitivity: "base",
            })
          );
        setCards(sorted);
      } catch (e) {
        console.error("listLevel1All failed:", e);
        if (alive) setCards([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [contentPath]);

  // Click-away & ESC to close dropdown
  useEffect(() => {
    if (!showKindsDropdown) return;

    function onDocClick(e: MouseEvent) {
      if (!kindsWrapRef.current) return;
      if (!kindsWrapRef.current.contains(e.target as Node)) {
        setShowKindsDropdown(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setShowKindsDropdown(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [showKindsDropdown]);

  // Mark the chip active when any kind is selected
  const kindsActive = kindFilters.length > 0;
  const genresActive = genreFilters.length > 0;
  const yearFilterActive = yearFilter !== null;
  const ratingFilterActive = ratingFilters.length >0;

  // Toggle a single kind in multiselect; do NOT close the menu
  function toggleKind(k: Shared.MediaKind) {
    setKindFilters((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  }
  function toggleGenre(g: Shared.Genre) {
    setGenreFilters((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }
  function toggleRating(r: Shared.Rating) {
    setRatingFilters((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  }

  // Clear Filters
  function clearKinds() {
    setKindFilters([]);
  }
  function clearGenres() {
    setGenreFilters([]);
  }
  function clearRatings() {
    setRatingFilters([]);
  }

  // Search + kind filtering
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    // When no kind selected, show all
    const kindFiltered =
      kindFilters.length === 0
        ? cards
        : cards.filter((c) => kindFilters.includes(c.kind));

    if (!s) return kindFiltered;

    return kindFiltered.filter((c) => c.title.toLowerCase().includes(s));

  }, [cards, q, kindFilters]);

  return (
    <div className="screen--wrap browse--wrap">
      {/* ===== Standard Header Search Bar ===== */}
      <Components.HeaderBar screenName={screenName} onBack={onBack} onProfileClick={onProfileClick} q={q} onChange={e => setQ(e.target.value)}/>

      {/* ===== Standard Subheader Filters Bar ===== */}
      <div className="subheader-bar--wrap browse-filter-bar--wrap">
        <div className="subheader-bar__btn-wrap" ref={kindsWrapRef}>
          <button
            className={`btn btn--secondary btn--md btn--oval btn--filter${kindsActive ? " is-active" : ""}`}
            aria-expanded={showKindsDropdown}
            aria-haspopup="menu"
            onClick={() => setShowKindsDropdown((v) => !v)}
          >
            Type
          </button>

          {showKindsDropdown && (
            <div className="dropdown-menu" role="menu" aria-label="Type filters">
              {/* Clear Filters action*/}
              <button
                type="button"
                className="dropdown-menu__entry--clear"
                role="menuitem"
                onClick={clearKinds}
              >
                Clear Filters
              </button>

              {/* Multiselect entries with checkboxes */}
              {KIND_OPTIONS.map((k) => {
                const active = kindFilters.includes(k);
                const label =
                  k === "movie" ? "Movies" :
                  k === "show"  ? "Shows"  :
                  k === "documentary"  ? "Documentaries" : k;

                return (
                  <label
                    key={k}
                    className={`dropdown-menu__entry${active ? " is-active" : ""}`}
                    role="menuitemcheckbox"
                    aria-checked={active}
                    // clicking label toggles checkbox, but keep clicks inside
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="dropdown-menu__check"
                      checked={active}
                      onChange={() => toggleKind(k)}
                    />
                    <span className="dropdown-menu__entry-label">{label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="subheader-bar__btn-wrap" ref={genresWrapRef}>
          <button
              className={`btn btn--secondary btn--md btn--oval btn--filter${genresActive ? " is-active" : ""}`}
              aria-expanded={showGenresDropdown}
              aria-haspopup="menu"
              onClick={() => setShowGenresDropdown((v) => !v)}
          >
            Genre
          </button>

          {showGenresDropdown && (
              <div className="dropdown-menu" role="menu" aria-label="Genre filters">
                {/* Clear Filters action*/}
                <button
                  type="button"
                  className="dropdown-menu__entry--clear"
                  role="menuitem"
                  onClick={clearGenres}
                >
                  Clear Filters
                </button>

                {/* Multiselect entries with checkboxes */}
                {GENRE_OPTIONS.map((g) => {
                  const active = genreFilters.includes(g);

                  return (
                    <label
                      key={g}
                      className={`dropdown-menu__entry${active ? " is-active" : ""}`}
                      role="menuitemcheckbox"
                      aria-checked={active}
                      // clicking label toggles checkbox, but keep clicks inside
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="dropdown-menu__check"
                        checked={active}
                        onChange={() => toggleGenre(g)}
                      />
                      <span className="dropdown-menu__entry-label">{g}</span>
                    </label>
                  );
                })}
              </div>
          )}
        </div>

        <div className="subheader-bar__btn-wrap" ref={yearWrapRef}>
          <button
              className={`btn btn--secondary btn--md btn--oval btn--filter${yearFilterActive ? " is-active" : ""}`}
              aria-expanded={showYearDropdown}
              aria-haspopup="menu"
              onClick={() => setShowYearDropdown((v) => !v)}
          >
            Year
          </button>

          {showYearDropdown && (
              <div className="dropdown-menu" role="menu" aria-label="Year filters">
                {/* Clear Filters action*/}
                <button
                  type="button"
                  className="dropdown-menu__entry--clear"
                  role="menuitem"
                  onClick={clearGenres}
                >
                  Clear Filters
                </button>
                <div>
                  <p>Specific Year:</p>
                  <input></input>
                </div>
                <div>
                  <p>Start Year:</p>
                  <input></input>
                </div>
                <div>
                  <p>End Year:</p>
                  <input></input>
                </div>

              </div>
          )}
        </div>

        <div className="subheader-bar__btn-wrap" ref={ratingWrapRef}>
          <button
            className={`btn btn--secondary btn--md btn--oval btn--filter${ratingFilterActive ? " is-active" : ""}`}
            aria-expanded={showRatingDropdown}
            aria-haspopup="menu"
            onClick={() => setShowRatingDropdown((v) => !v)}
          >
            Rating
          </button>

          {showRatingDropdown && (
            <div className="dropdown-menu" role="menu" aria-label="Rating filters">
              {/* Clear Filters action*/}
              <button
                type="button"
                className="dropdown-menu__entry--clear"
                role="menuitem"
                onClick={clearRatings}
              >
                Clear Filters
              </button>

              {/* Multiselect entries with checkboxes */}
              {RATING_OPTIONS.map((r) => {
                const active = ratingFilters.includes(r);
                return (
                  <label
                    key={r}
                    className={`dropdown-menu__entry${active ? " is-active" : ""}`}
                    role="menuitemcheckbox"
                    aria-checked={active}
                    // clicking label toggles checkbox, but keep clicks inside
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="dropdown-menu__check"
                      checked={active}
                      onChange={() => toggleRating(r)}
                    />
                    <span className="dropdown-menu__entry-label">{r}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {isLoading && (
      <div className="browse__cards--empty">Loading... 🙂</div>
      )}
      {cards.length > 0 && filtered.length === 0 && (
        <div className="browse__cards--empty">No matches.</div>
      )}
      {cards.length === 0 && !isLoading && (
        <div className="browse__cards--empty">No items found.</div>
      )}

      {/* ===== Cards Grid ===== */}
      {cards.length > 0 && (
      <div className="browse__cards-grid">
        {filtered.map((m, i) => (
        <div className="browse__grid-card is-clickable" key={`${m.title}-${m.year ?? ""}-${i}`} onClick={() => onOpenCard(m)}>
          {/* Poster */}
          <Components.Poster path={m.posterPath} title={m.title} screenName={screenName}/>
          {/* Body */}
          <div className="card-body">
            <div className="title-row">
              <h1 className="title" title={m.title}>{m.title}</h1>
            </div>
          </div>
        </div>
        ))}
      </div>
      )}

    </div>
  );
}

export default Browse;